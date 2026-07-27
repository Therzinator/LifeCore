import { bepaalSignalen as welzijnSignalen } from '../welzijn/signalering.js';
import { maandagVan, datumKey } from '../../utils/datum.js';
import { geplandeMinuten } from '../eigenbedrijf/blokken.js';
import { weekTotalen } from '../eigenbedrijf/uren.js';

// Kruismodule-signalenlaag — zie docs/SIGNALEN.md voor het volledige ontwerp.
// Koppeling 1 (Welzijn → Mindfulness) staat hier bewust NIET in: die is al
// vóór dit bestand gebouwd (Module 5) met een instelbaar impactpercentage
// i.p.v. de simpele aan/uit hieronder — zie lib/welzijn/mindfulnessSignaal.js.

// KOPPELING 2 — Welzijn → Waarden (ACT)
// Zelfde bron-signaal als koppeling 1 (Welzijn's eigen, klinisch onderbouwde
// Signaal A/B), hier als simpele aan/uit i.p.v. percentage — de Waarden-
// module heeft geen equivalent van Mindfulness' expliciete instelbare
// "hoe sterk"-vraag gekregen, dus de oorspronkelijke ontwerpdoc-vorm blijft
// hier van kracht.
export function koppeling2_welzijnNaarWaarden(welzijnAfnames, actief) {
  if (!actief || welzijnSignalen(welzijnAfnames).length === 0) return null;
  return {
    id: 'welzijn_naar_waarden',
    bron: 'welzijn',
    doel: 'waarden',
    ernst: 'aandacht',
    tekst: 'Je hersteltrend vraagt aandacht — het kan helpen om een lastige gedachte hieronder op afstand te zetten.',
  };
}

// KOPPELING 3 — Welzijn → Focus (ADHD-module)
// Alleen Signaal A (aanhoudende uitputting) telt hier — Signaal B (dalende
// hersteltrend) gaat over herstel-capaciteit, niet over acute belasting, en
// is dus geen reden om de daglimiet te verlagen. Geeft een boolean terug in
// plaats van een Signaal-object: het effect is een aanpassing van bestaande
// logica (dagLimiet.js), geen suggestiekaart.
export function koppeling3_welzijnNaarFocus(welzijnAfnames, actief) {
  if (!actief) return false;
  return welzijnSignalen(welzijnAfnames).some((s) => s.type === 'uitputting');
}

// KOPPELING 4 — Training → Ochtend
// Drempel: 3 weken zonder sessie. Een trainingsschema gaat uit van 2-3x per
// week (zie TrainingInstellingen/schema.js) — 3 weken zonder sessie is dus
// drie gemiste trainingscycli, niet één gemiste dag. Hetzelfde principe als
// Module 3's "geen ronde getallen zonder reden".
const TRAINING_STAGNATIE_WEKEN = 3;

export function koppeling4_trainingNaarOchtend(laatsteTrainingDatumIso, actief) {
  if (!actief || !laatsteTrainingDatumIso) return null;
  const dagenGeleden = Math.floor((Date.now() - new Date(laatsteTrainingDatumIso).getTime()) / (1000 * 60 * 60 * 24));
  if (dagenGeleden < TRAINING_STAGNATIE_WEKEN * 7) return null;
  return {
    id: 'training_naar_ochtend',
    bron: 'training',
    doel: 'ochtend',
    ernst: 'info',
    tekst: 'Het is een tijd geleden sinds je laatste training — vandaag hoeft niet zwaar te zijn.',
  };
}

// KOPPELING 5 — Werk → Welzijn
// "Ongebruikelijk druk" = deze week minstens 50% meer afgeronde taken dan
// het gemiddelde van de voorgaande weken, mét een ondergrens van 5 taken —
// zonder die ondergrens zou een stille week van 1 taak naar 2 taken al als
// "50% drukker" gelden, wat geen betekenisvol signaal is op zo'n kleine
// schaal.
const WERK_DRUK_FACTOR = 1.5;
const WERK_DRUK_MINIMUM = 5;

export function afgerondeTakenPerWeek(taken) {
  const perWeek = {};
  taken.forEach((t) => {
    if (!t.afgerondOp) return;
    const week = maandagVan(t.afgerondOp);
    perWeek[week] = (perWeek[week] ?? 0) + 1;
  });
  return Object.entries(perWeek)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekMaandag, aantal]) => ({ weekMaandag, aantal }));
}

export function koppeling5_werkNaarWelzijn(weekReeks, actief) {
  if (!actief || weekReeks.length < 2) return null;
  const huidigeWeek = maandagVan(new Date().toISOString());
  const huidig = weekReeks[weekReeks.length - 1];
  if (huidig.weekMaandag !== huidigeWeek) return null;

  const eerdere = weekReeks.slice(0, -1);
  const gemiddelde = eerdere.reduce((som, w) => som + w.aantal, 0) / eerdere.length;
  const druk = huidig.aantal >= WERK_DRUK_MINIMUM && huidig.aantal >= gemiddelde * WERK_DRUK_FACTOR;
  if (!druk) return null;

  return {
    id: 'werk_naar_welzijn',
    bron: 'werk',
    doel: 'welzijn',
    ernst: 'info',
    tekst: 'Deze week valt op als drukker dan gebruikelijk. Je burn-out/herstel-check hoeft niet te wachten tot de geplande datum als je nu al behoefte hebt aan een check.',
  };
}

// KOPPELING 6 — Eigen bedrijf → Eigen bedrijf (zelf-koppeling)
// Bron en doel zijn hier bewust dezelfde module: de toggle en de
// drempelinstellingen (wekenOpRij/pctBovenSchema) leven in Eigen bedrijf's
// eigen instellingen (useEigenBedrijfInstellingen), niet in een andere
// module — anders dan koppeling 2-5 hoeft de aanroeper dus geen los
// toggle-argument door te geven, useKruisSignalen leest deze instelling
// rechtstreeks uit dezelfde hook als de blokken/drempels zelf.
//
// Kijkt alleen naar AFGERONDE weken (nooit de lopende week — die toont het
// zondag-toetsmoment al live) en loopt terug tot de eerste week die wél
// gelogde tijd heeft maar niet over de drempel zit — dat breekt de reeks.
// Een week zonder enige gelogde sessie breekt de reeks niet (waarschijnlijk
// gewoon niet gelogd, geen uitspraak over overschrijding) maar telt ook
// niet mee als overschrijding. Begrensde terugblik (EIGEN_BEDRIJF_MAX_
// TERUGBLIK_WEKEN) voorkomt een onbegrensde lus bij oude/lege data.
const EIGEN_BEDRIJF_MAX_TERUGBLIK_WEKEN = 26;

export function koppeling6_eigenBedrijfOverschrijding(sessies, blokken, { wekenOpRij, pctBovenSchema }, actief) {
  if (!actief) return null;
  const gepland = geplandeMinuten(blokken).werkTotaal;
  if (gepland <= 0) return null;

  const drempelMinuten = gepland * (1 + pctBovenSchema / 100);
  const huidigeWeek = maandagVan(new Date().toISOString());
  const cursor = new Date(huidigeWeek);
  cursor.setDate(cursor.getDate() - 7); // eerste AFGERONDE week, niet de lopende

  let opRij = 0;
  for (let i = 0; i < EIGEN_BEDRIJF_MAX_TERUGBLIK_WEKEN; i += 1) {
    const weekMaandag = datumKey(cursor);
    const totaal = weekTotalen(sessies, weekMaandag).totaal;

    if (totaal === 0) {
      cursor.setDate(cursor.getDate() - 7);
      continue;
    }
    if (totaal < drempelMinuten) break;

    opRij += 1;
    if (opRij >= wekenOpRij) {
      return {
        id: 'eigenbedrijf_overschrijding',
        bron: 'werk',
        doel: 'werk',
        ernst: 'aandacht',
        tekst: `Je zit nu ${opRij} weken op rij ruim boven je eigen TJB Solutions-schema. Geen paniek — misschien klopt het schema niet meer, in plaats van dat jij iets fout doet.`,
      };
    }
    cursor.setDate(cursor.getDate() - 7);
  }
  return null;
}
