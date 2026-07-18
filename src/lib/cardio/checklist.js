// De drie vaste buitenactiviteiten uit de interviewbeslissing — bewust geen
// open lijst (geen stadswandelingen, geen fietsen hier): alleen gedaan/niet
// gedaan, geen afstand/tijd. Losstaand van de rijkere cardio_sessies-log,
// die blijft beschikbaar voor wie toch gedetailleerd wil loggen.
export const CARDIO_ACTIVITEITEN = [
  { id: 'hardlopen', label: 'Hardlopen (bos)' },
  { id: 'wandelen', label: 'Wandelen met de hond (natuur)' },
  { id: 'roeien', label: 'Roeimachine (binnen)' },
];

function maandagVan(datumIso) {
  const d = new Date(datumIso);
  const dag = d.getDay() || 7;
  d.setDate(d.getDate() - (dag - 1));
  return d.toISOString().slice(0, 10);
}

// Telt het aantal afgevinkte activiteiten per week — geschiedenis blijft
// altijd intact (record wordt nooit gewist), een gemiste week levert
// gewoon geen punt op, geen negatieve markering.
export function checklistPerWeek(record, weken = 12) {
  const perWeek = {};
  Object.entries(record).forEach(([datum, activiteiten]) => {
    const aantal = CARDIO_ACTIVITEITEN.filter((a) => activiteiten[a.id]).length;
    if (aantal === 0) return;
    const week = maandagVan(datum);
    perWeek[week] = (perWeek[week] ?? 0) + aantal;
  });

  const labels = Object.keys(perWeek).sort().slice(-weken);
  const aantalPerWeek = labels.map((w) => perWeek[w]);
  return { labels, aantalPerWeek };
}
