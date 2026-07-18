function maandagVan(datum) {
  const d = new Date(datum);
  const dag = d.getDay() || 7;
  d.setDate(d.getDate() - (dag - 1));
  return d.toISOString().slice(0, 10);
}

export function huidigePeriodeKey(frequentie, nu = new Date()) {
  return frequentie === 'maand' ? nu.toISOString().slice(0, 7) : maandagVan(nu);
}

// Percentage afgerond voor de huidige periode (deze week/maand) — voor de
// checklist-graad in de Huishouden-tab zelf.
export function percentageAfgerond(taken, log, frequentie, nu = new Date()) {
  const relevant = taken.filter((t) => t.frequentie === frequentie);
  if (relevant.length === 0) return null;
  const periode = huidigePeriodeKey(frequentie, nu);
  const afgerond = relevant.filter((t) => log[t.id]?.[periode]).length;
  return { afgerond, totaal: relevant.length, percentage: Math.round((afgerond / relevant.length) * 100) };
}

// Percentage per week over de laatste N weken, óók voor weken zonder enige
// afgevinkte taak — een gemiste week levert een eerlijke 0% op i.p.v. dat
// de week gewoon niet verschijnt. Geschiedenis blijft zo altijd zichtbaar.
export function percentagePerWeek(taken, log, weken = 12, nu = new Date()) {
  const weekTaken = taken.filter((t) => t.frequentie === 'week');
  if (weekTaken.length === 0) return { labels: [], percentages: [] };

  const huidigeMaandag = new Date(huidigePeriodeKey('week', nu));
  const labels = [];
  for (let i = weken - 1; i >= 0; i--) {
    const d = new Date(huidigeMaandag);
    d.setDate(d.getDate() - i * 7);
    labels.push(d.toISOString().slice(0, 10));
  }

  const percentages = labels.map((week) => {
    const afgerond = weekTaken.filter((t) => log[t.id]?.[week]).length;
    return Math.round((afgerond / weekTaken.length) * 100);
  });

  return { labels, percentages };
}
