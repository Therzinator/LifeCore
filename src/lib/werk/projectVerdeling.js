// LPT (Longest Processing Time first) — sorteer klusjes van zwaar naar
// licht, wijs elk klusje toe aan de maand met op dat moment de laagste
// totale geschatte belasting. Dit is de standaard, bewezen aanpak voor
// "verdeel N items met verschillend gewicht zo gelijkmatig mogelijk over K
// bakken" (multiprocessor scheduling) — geen zelfverzonnen heuristiek, en
// ruim beter dan simpelweg in volgorde doorschuiven (dat zou zware klusjes
// kunnen ophopen in één maand).
function maandOffset(startMaand, offset) {
  const [jaar, maand] = startMaand.split('-').map(Number);
  const datum = new Date(jaar, maand - 1 + offset, 1);
  return `${datum.getFullYear()}-${String(datum.getMonth() + 1).padStart(2, '0')}`;
}

export function maandLabel(maandKey) {
  const [jaar, maand] = maandKey.split('-').map(Number);
  const datum = new Date(jaar, maand - 1, 1);
  return datum.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' });
}

function datumKeyNaarUtcDagen(datumKeyStr) {
  const [jaar, maand, dag] = datumKeyStr.split('-').map(Number);
  return Date.UTC(jaar, maand - 1, dag) / (1000 * 60 * 60 * 24);
}

// Beide data zijn 'YYYY-MM-DD'-sleutels (zie utils/datum.js datumKey) —
// vergelijken via Date.UTC-dagen i.p.v. new Date(iso) - new Date(iso)
// voorkomt dat een DST-overgang tussen de twee data het aantal dagen met 1
// laat verschieten.
export function dagenTotDeadline(deadlineDatumKey, vandaagDatumKey) {
  if (!deadlineDatumKey) return null;
  return Math.round(datumKeyNaarUtcDagen(deadlineDatumKey) - datumKeyNaarUtcDagen(vandaagDatumKey));
}

// Taakvolgorde: een item (klusje óf stap) met een vereistKlusjeId is pas 'op
// te pakken' zodra dat andere item (uit hetzelfde project) is afgerond. De
// vereiste kan zowel een heel klusje als een stap van een ANDER klusje zijn
// — zie alleItemsVanProject hieronder, dat beide soorten platslaat tot één
// lijst zodat deze check niet hoeft te weten met welk soort item hij te
// maken heeft. Een vereiste die niet meer bestaat (verwijderd) telt niet als
// blokkade — zie ook de opruim-stap in useHuishoudProjecten.verwijderKlusje,
// die dit in de praktijk al voorkomt door de referentie meteen te wissen.
export function isGeblokkeerd(item, alleItemsVanProjectLijst) {
  if (!item.vereistKlusjeId) return false;
  const vereiste = alleItemsVanProjectLijst.find((i) => i.id === item.vereistKlusjeId);
  return Boolean(vereiste && !vereiste.afgerond);
}

// Platte lijst van alle klusjes ÉN al hun stappen van een project — elk als
// eigen 'knoop' met een klusjeId (voor een klusje zelf is dat zijn eigen id,
// voor een stap het id van zijn ouder-klusje). Basis voor zowel de
// 'Taak kan pas na'-keuzeopties (vereisteOpties) als isGeblokkeerd-checks op
// stap-niveau, en voor het herleiden van stap-afhankelijkheden naar
// maand-planning (zie vereistenPerKlusjeBerekenen hieronder).
export function alleItemsVanProject(klusjes) {
  const items = [];
  klusjes.forEach((k) => {
    items.push({ id: k.id, tekst: k.tekst, afgerond: k.afgerond, klusjeId: k.id, isStap: false });
    (k.subklusjes ?? []).forEach((s) => {
      items.push({ id: s.id, tekst: `${k.tekst} — ${s.tekst}`, afgerond: s.afgerond, klusjeId: k.id, isStap: true });
    });
  });
  return items;
}

// Geldige 'Taak kan pas na'-opties voor een gegeven item (itemId, horend bij
// klusjeId): alle andere klusjes en stappen in het project, BEHALVE
// zichzelf en de twee triviale ouder/kind-gevallen — een klusje kan niet
// afhangen van zijn EIGEN stap, en een stap niet van zijn EIGEN ouder-klusje
// (beide beschrijven hetzelfde onderdeel, geen echte afhankelijkheid).
// Stappen van HETZELFDE klusje onderling (bv. stap 2 pas na stap 1) zijn wel
// toegestaan.
export function vereisteOpties(klusjes, itemId, klusjeId) {
  const itemIsKlusje = itemId === klusjeId;
  return alleItemsVanProject(klusjes).filter((kandidaat) => {
    if (kandidaat.id === itemId) return false;
    if (!itemIsKlusje && kandidaat.id === klusjeId) return false;
    if (itemIsKlusje && kandidaat.klusjeId === klusjeId && kandidaat.isStap) return false;
    return true;
  });
}

// Stappen (zie StappenLijst in HuishoudProjecten.jsx) hebben elk hun eigen
// duur; een klusje met stappen krijgt geen losse, los-staande geschatteUren
// meer — de som van zijn stappen bepaalt de totale duur. Zonder stappen
// blijft het bestaande, handmatig ingestelde geschatteUren gelden.
export function berekenGeschatteUren(klusje) {
  const stappen = klusje.subklusjes ?? [];
  if (stappen.length === 0) return klusje.geschatteUren ?? 1;
  // Stappen van vóór dit veld (of zonder expliciete duur) tellen als 0.5u —
  // dezelfde default als een nieuwe stap — i.p.v. 0, zodat oudere, nog
  // ongewijzigde stappen niet stilzwijgend de totale duur naar 0 trekken.
  return stappen.reduce((som, s) => som + (s.duurUren ?? 0.5), 0);
}

// Herleidt de KLUSJE-brede vereisten van elk klusje: zijn eigen
// vereistKlusjeId (die op een klusje óf een stap kan wijzen) plus, voor elk
// van zijn eigen stappen, diens vereistKlusjeId — beide opgelost naar het
// klusje waar het doel-item bij hoort (alleItemsVanProject.klusjeId). Een
// stap die afhangt van een SIBLING-stap binnen hetzelfde klusje levert geen
// extra maand-vereiste op (dat is al hetzelfde klusje/dezelfde maand); een
// stap die afhangt van een ANDER klusje (of een stap daarvan) telt wél mee
// — dat andere klusje moet dan even ver naar voren als nodig.
function vereistenPerKlusjeBerekenen(klusjes) {
  const alleItems = alleItemsVanProject(klusjes);
  const klusjeIdVan = (itemId) => alleItems.find((i) => i.id === itemId)?.klusjeId;

  const map = new Map();
  klusjes.forEach((k) => {
    const ids = new Set();
    const voegToe = (vereistId) => {
      const doelKlusjeId = vereistId ? klusjeIdVan(vereistId) : undefined;
      if (doelKlusjeId && doelKlusjeId !== k.id) ids.add(doelKlusjeId);
    };
    voegToe(k.vereistKlusjeId);
    (k.subklusjes ?? []).forEach((s) => voegToe(s.vereistKlusjeId));
    map.set(k.id, [...ids]);
  });
  return map;
}

// Vergelijkt twee klusjes voor de wachtrij: prioriteit (bv. een externe
// deadline zoals geleend gereedschap of een weerraam) gaat altijd vóór LPT
// — een klusje met prioriteit claimt de eerst-beschikbare/lichtste maand
// vóór elk niet-prioritair klusje, ongeacht hun geschatteUren. Dit is
// 'priority list scheduling', dezelfde Graham-lijn als LPT maar met een
// expliciete prioriteitsklasse als eerste sorteersleutel i.p.v. alleen
// gewicht — nog steeds geen zelfverzonnen heuristiek.
function vergelijkVoorWachtrij(a, b) {
  const prioriteitVerschil = (b.prioriteit ? 1 : 0) - (a.prioriteit ? 1 : 0);
  if (prioriteitVerschil !== 0) return prioriteitVerschil;
  return (b.geschatteUren ?? 1) - (a.geschatteUren ?? 1);
}

// Verwerkingsvolgorde die 'Taak kan pas na' (vereistenPerKlusje, mogelijk
// meerdere per klusje) respecteert: Kahn's topologische sortering, met
// prioriteit+LPT (zie vergelijkVoorWachtrij) als tiebreak tussen klusjes die
// op hetzelfde moment 'vrij' zijn — dit is 'list scheduling met precedence
// constraints' (Graham, 1966), de standaard uitbreiding van LPT zodra taken
// een onderlinge volgorde-eis hebben, geen zelfverzonnen heuristiek. Een
// vereiste die niet bestaat of een cirkel vormt blijft bewust zonder crash
// gewoon achteraan hangen — zie ook isGeblokkeerd's toelichting: geen
// cirkel-detectie, in het ergste geval mist één klusje een optimale plek,
// dat herstelt de gebruiker zelf door de vereiste los te koppelen.
function topologischeVolgorde(klusjes, vereistenPerKlusje) {
  const byId = new Map(klusjes.map((k) => [k.id, k]));
  const afhankelijken = new Map(klusjes.map((k) => [k.id, []]));
  const inDegree = new Map(klusjes.map((k) => [k.id, 0]));

  klusjes.forEach((k) => {
    const vereisten = (vereistenPerKlusje.get(k.id) ?? []).filter((vid) => byId.has(vid));
    inDegree.set(k.id, vereisten.length);
    vereisten.forEach((vid) => afhankelijken.get(vid).push(k.id));
  });

  const wachtrij = klusjes.filter((k) => inDegree.get(k.id) === 0);
  const verwerkt = new Set();
  const resultaat = [];

  while (wachtrij.length > 0) {
    wachtrij.sort(vergelijkVoorWachtrij);
    const volgende = wachtrij.shift();
    if (verwerkt.has(volgende.id)) continue;
    verwerkt.add(volgende.id);
    resultaat.push(volgende);
    (afhankelijken.get(volgende.id) ?? []).forEach((afhankelijkeId) => {
      const nieuw = (inDegree.get(afhankelijkeId) ?? 0) - 1;
      inDegree.set(afhankelijkeId, nieuw);
      if (nieuw <= 0 && !verwerkt.has(afhankelijkeId)) wachtrij.push(byId.get(afhankelijkeId));
    });
  }

  klusjes.forEach((k) => { if (!verwerkt.has(k.id)) resultaat.push(k); });
  return resultaat;
}

export function verdeelKlusjesOverMaanden(klusjes, aantalMaanden, startMaand) {
  const maanden = Array.from({ length: Math.max(1, aantalMaanden) }, (_, i) => ({
    index: i,
    maand: maandOffset(startMaand, i),
    belasting: 0,
  }));

  const vereistenPerKlusje = vereistenPerKlusjeBerekenen(klusjes);
  const maandIndexPerId = {};

  return topologischeVolgorde(klusjes, vereistenPerKlusje).map((klusje) => {
    // Een klusje mag nooit vóór (het zwaarste van) zijn vereisten ingepland
    // staan — die zijn (dankzij de topologische volgorde hierboven) al
    // verwerkt en hebben dus al een maand-index, die hier als ondergrens
    // dient. Zo schuiven de vereisten zelf altijd even ver naar voren als
    // nodig, i.p.v. dat de afhankelijke klus er willekeurig vóór belandt.
    const indices = (vereistenPerKlusje.get(klusje.id) ?? [])
      .map((vid) => maandIndexPerId[vid])
      .filter((i) => i !== undefined);
    const minIndex = indices.length > 0 ? Math.max(...indices) : 0;
    const kandidaten = maanden.filter((m) => m.index >= minIndex);
    const doelMaand = kandidaten.reduce((min, m) => (m.belasting < min.belasting ? m : min), kandidaten[0]);
    doelMaand.belasting += klusje.geschatteUren ?? 1;
    maandIndexPerId[klusje.id] = doelMaand.index;
    return { ...klusje, maand: doelMaand.maand };
  });
}

// Groepeert een al-verdeelde klusjeslijst per maand, in chronologische
// volgorde — voor de weergave in een maandelijks schema.
export function groepeerPerMaand(klusjes) {
  const perMaand = {};
  klusjes.forEach((k) => {
    if (!perMaand[k.maand]) perMaand[k.maand] = [];
    perMaand[k.maand].push(k);
  });
  return Object.entries(perMaand).sort(([a], [b]) => a.localeCompare(b));
}

// Verdeelt de klusjes van een project over de maanden en groepeert het
// resultaat — voor de projectweergave in Kluslijst. Wordt bij elke render
// vers berekend (net als herverdeel() in useHuishoudProjecten na een
// mutatie) i.p.v. de maand-toewijzing te bewaren op het klusje zelf.
export function projectMaandOverzicht(klusjes, aantalMaanden, startMaand) {
  const verdeeld = verdeelKlusjesOverMaanden(klusjes, aantalMaanden, startMaand);
  return groepeerPerMaand(verdeeld);
}
