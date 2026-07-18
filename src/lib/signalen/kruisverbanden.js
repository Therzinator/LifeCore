import { bepaalSignalen as welzijnSignalen } from '../welzijn/signalering.js';
import { maandagVan } from '../../utils/datum.js';

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
