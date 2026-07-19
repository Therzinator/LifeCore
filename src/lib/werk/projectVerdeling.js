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

export function verdeelKlusjesOverMaanden(klusjes, aantalMaanden, startMaand) {
  const maanden = Array.from({ length: Math.max(1, aantalMaanden) }, (_, i) => ({
    maand: maandOffset(startMaand, i),
    belasting: 0,
  }));

  const gesorteerd = [...klusjes].sort((a, b) => (b.geschatteUren ?? 1) - (a.geschatteUren ?? 1));

  return gesorteerd.map((klusje) => {
    const lichtsteMaand = maanden.reduce((min, m) => (m.belasting < min.belasting ? m : min), maanden[0]);
    lichtsteMaand.belasting += klusje.geschatteUren ?? 1;
    return { ...klusje, maand: lichtsteMaand.maand };
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

// Zet een werktaak om naar een klusje-vormig item — focusMinuten (bedoeld
// als 'hoeveel tijd kost deze taak', al gebruikt door de focus-timer in
// Werktaken) hergebruikt als geschatteUren voor de maandverdeling, zodat er
// geen los, tweede 'hoe zwaar is dit'-veld nodig is. Zonder focusMinuten
// wordt 1 uur aangenomen, gelijk aan het klusjes-default.
function werktaakAlsItem(taak) {
  return {
    id: taak.id,
    tekst: taak.tekst,
    geschatteUren: (taak.focusMinuten || 60) / 60,
    afgerond: taak.klaar,
    afgerondOp: taak.afgerondOp,
    bron: 'werk',
  };
}

// Combineert de klusjes van een project met de aan dat project gekoppelde
// werktaken tot één, samen over de maanden verdeelde en gegroepeerde lijst
// — voor de projectweergave in Kluslijst. Wordt bij elke render vers
// berekend (net als herverdeel() in useHuishoudProjecten na een mutatie)
// i.p.v. de maand-toewijzing op de werktaak zelf te bewaren: werktaken
// leven in een aparte store (useWerkTaken), dus een bewaarde toewijzing zou
// bij elke wijziging aan weerskanten los van elkaar kunnen gaan lopen.
export function projectMaandOverzicht(klusjes, gekoppeldeWerktaken, aantalMaanden, startMaand) {
  const huishoudItems = klusjes.map((k) => ({ ...k, bron: 'huishouden' }));
  const werkItems = gekoppeldeWerktaken.map(werktaakAlsItem);
  const verdeeld = verdeelKlusjesOverMaanden([...huishoudItems, ...werkItems], aantalMaanden, startMaand);
  return groepeerPerMaand(verdeeld);
}
