// Bull's-Eye waardenkompas — 4 vaste levensdomeinen (i.p.v. de vrije
// kernwaarden-lijst uit waarden.js) zodat elke invulling over tijd
// vergelijkbaar blijft; de vrije kernwaarden-keuze elders in de module
// blijft ongemoeid, dit is een apart, periodiek instrument.
export const KOMPAS_DOMEINEN = [
  { id: 'werk', label: 'Werk', labelKort: 'Werk', hoekGraden: -45 },
  { id: 'vrijeTijd', label: 'Vrije tijd', labelKort: 'Vrije tijd', hoekGraden: 45 },
  { id: 'relaties', label: 'Relaties', labelKort: 'Relaties', hoekGraden: 135 },
  { id: 'groei', label: 'Groei & gezondheid', labelKort: 'Groei', hoekGraden: -135 },
];

export const KOMPAS_CADANS_OPTIES = [
  { dagen: 7, label: 'Wekelijks' },
  { dagen: 30, label: 'Maandelijks' },
  { dagen: 90, label: 'Per kwartaal' },
];

export const KOMPAS_CADANS_STANDAARD = 30;

// Score 10 = leef ik precies zoals ik zou willen op dit domein (roos, midden
// van het bord); score 1 = ver van hoe ik zou willen leven (buitenste ring).
export function kompasScores(antwoorden) {
  const scores = {};
  KOMPAS_DOMEINEN.forEach((d) => {
    const score = antwoorden[d.id]?.score;
    scores[d.id] = typeof score === 'number' ? score : null;
  });
  return scores;
}

// Richting i.p.v. een kaal cijferverschil — het gaat om trend zien, niet
// een score als beoordeling laten voelen.
export function kompasTrend(laatsteScores, vorigeScores) {
  if (!laatsteScores || !vorigeScores) return null;
  const trend = {};
  KOMPAS_DOMEINEN.forEach((d) => {
    const nu = laatsteScores[d.id];
    const toen = vorigeScores[d.id];
    if (typeof nu !== 'number' || typeof toen !== 'number') { trend[d.id] = null; return; }
    trend[d.id] = nu > toen ? 'dichterbij' : nu < toen ? 'verder' : 'gelijk';
  });
  return trend;
}
