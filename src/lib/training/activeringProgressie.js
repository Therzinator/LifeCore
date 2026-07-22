// Wekelijkse, voorzichtige opbouw van de plank- en push-up-doelen in de
// Ochtend-activering (zie StapActivering.jsx) — los van de gewicht-
// progressie hierboven (progressie.js), die is voor de LiftCore-oefeningen.
// 'Geleidelijk rustig aan' vertaalt naar: pas verhogen na een paar
// succesvolle dagen in de afgelopen week (niet al na één keer), en weer
// afbouwen (deload) als de gebruiker een tijd niets heeft gedaan i.p.v. het
// doel gewoon te laten staan tot een oude, te zware target weer opduikt.
export const PLANK_STAP_SECONDEN = 5; // zelfde stapgrootte als de -5s/+5s-knoppen in StapActivering.jsx
export const PLANK_MINIMUM_SECONDEN = 15;
export const PUSH_STAP_REPS = 1;
export const PUSH_MINIMUM_REPS = 5;
export const WEEK_VENSTER_DAGEN = 7;
export const MIN_GESLAAGDE_DAGEN_VOOR_OPBOUW = 3;
export const DELOAD_NA_DAGEN = 10;
export const DELOAD_FACTOR = 0.7;

function dagenTussen(vanDatum, totDatum) {
  return Math.round((new Date(totDatum) - new Date(vanDatum)) / 86400000);
}

function laatsteDatum(sessies) {
  return sessies.reduce((laatste, s) => (s.datum > laatste ? s.datum : laatste), sessies[0].datum);
}

function volgendDoel({ sessies, huidigDoel, stap, minimum, veldGedaan, veldWaarde, vandaag }) {
  if (sessies.length === 0) return huidigDoel;

  const gapDagen = dagenTussen(laatsteDatum(sessies), vandaag);
  if (gapDagen > DELOAD_NA_DAGEN) {
    return Math.max(minimum, Math.round((huidigDoel * DELOAD_FACTOR) / stap) * stap);
  }

  const afgelopenWeek = sessies.filter((s) => dagenTussen(s.datum, vandaag) < WEEK_VENSTER_DAGEN);
  const geslaagd = afgelopenWeek.filter((s) => s[veldGedaan] && (s[veldWaarde] ?? 0) >= huidigDoel);
  if (geslaagd.length >= MIN_GESLAAGDE_DAGEN_VOOR_OPBOUW) {
    return huidigDoel + stap;
  }
  return huidigDoel;
}

export function volgendPlankDoel(sessies, huidigDoel, vandaag) {
  return volgendDoel({
    sessies, huidigDoel, vandaag,
    stap: PLANK_STAP_SECONDEN, minimum: PLANK_MINIMUM_SECONDEN,
    veldGedaan: 'plankGedaan', veldWaarde: 'plankSeconden',
  });
}

export function volgendPushDoel(sessies, huidigDoel, vandaag) {
  return volgendDoel({
    sessies, huidigDoel, vandaag,
    stap: PUSH_STAP_REPS, minimum: PUSH_MINIMUM_REPS,
    veldGedaan: 'pushGedaan', veldWaarde: 'pushReps',
  });
}
