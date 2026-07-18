const STAP_STANDAARD = 2.5;
const STAP_DEADLIFT = 5;

export function volgendeGewicht(huidigGewicht, oefeningId) {
  const stap = oefeningId === 'deadlift' ? STAP_DEADLIFT : STAP_STANDAARD;
  return huidigGewicht + stap;
}

export function isNieuwePR(oefeningId, gewicht, sessies) {
  const eerdereGewichten = sessies.flatMap((sessie) =>
    sessie.oefeningen.filter((o) => o.id === oefeningId).map((o) => o.gewicht),
  );
  if (eerdereGewichten.length === 0) return true;
  return gewicht > Math.max(...eerdereGewichten);
}

// Epley-formule: 1RM = gewicht × (1 + reps/30) — alleen als richtlijn.
export function bereken1RM(gewicht, reps = 5) {
  return Math.round(gewicht * (1 + reps / 30));
}
