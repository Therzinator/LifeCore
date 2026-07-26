const STANG_RECHT_STD = 20;
const STANG_CURL_STD = 10;

// Standaardwaarden voor de opbouwsets (ramp-up naar het werkgewicht) — een
// gebruiker kan dit via Training-instellingen naar eigen voorkeur aanpassen
// (zie useTrainingInstellingen.js), dit blijft de fallback voor oudere,
// lokaal opgeslagen instellingen die het veld nog niet kennen.
export const OPBOUW_STAPPEN_STANDAARD = [
  { pct: 40, reps: 5 },
  { pct: 60, reps: 3 },
  { pct: 80, reps: 2 },
];

// Deadlift is de laatste, zwaarste oefening van de sessie met maar 1 werkset —
// je bent dan al warm van squat/bench/ohp ervoor. Minder en grotere sprongen
// (en geen aparte 'lege stang'-set, zoals bij StrongLifts) i.p.v. dezelfde
// 4-staps opbouw die de andere hoofdlifts gebruiken.
const OPBOUW_STAPPEN_DEADLIFT = [
  { pct: 50, reps: 5 },
  { pct: 70, reps: 3 },
  { pct: 85, reps: 1 },
];

const DEADLIFT_ACHTIGE_IDS = new Set(['deadlift', 'sumo-deadlift']);

export function berekenOpbouwsets(werkgewicht, stangType = 'recht', gewichtStap = 2.5, instStangen = {}, opbouwStappen = OPBOUW_STAPPEN_STANDAARD, oefeningId = null) {
  const isDeadliftAchtig = DEADLIFT_ACHTIGE_IDS.has(oefeningId);
  const stappen = isDeadliftAchtig ? OPBOUW_STAPPEN_DEADLIFT : opbouwStappen;
  const stangGewicht = stangType === 'curl'
    ? (instStangen.stangCurl ?? STANG_CURL_STD)
    : (instStangen.stangRecht ?? STANG_RECHT_STD);
  const rond = (g) => Math.round(g / gewichtStap) * gewichtStap;

  const kandidaten = [
    ...(isDeadliftAchtig ? [] : [{ label: 'Lege stang', gewicht: stangGewicht, reps: 5 }]),
    ...stappen.map((stap) => ({
      label: `${stap.pct}%`,
      gewicht: rond(werkgewicht * (stap.pct / 100)),
      reps: stap.reps,
    })),
  ];

  const gezien = new Set();
  const resultaat = [];
  for (const set of kandidaten) {
    if (set.gewicht >= werkgewicht) continue;
    if (gezien.has(set.gewicht)) continue;
    gezien.add(set.gewicht);
    resultaat.push(set);
  }
  return resultaat;
}
