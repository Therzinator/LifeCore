export function vandaagKey() {
  const d = new Date();
  const jaar = d.getFullYear();
  const maand = String(d.getMonth() + 1).padStart(2, '0');
  const dag = String(d.getDate()).padStart(2, '0');
  return `${jaar}-${maand}-${dag}`;
}

// Maandag = 0 t/m zondag = 6 — Date.getDay() geeft zondag = 0, vandaar de omzetting.
export function dagIndexVan(datumIso) {
  const d = new Date(datumIso).getDay();
  return d === 0 ? 6 : d - 1;
}

export function maandagVan(datumIso) {
  const d = new Date(datumIso);
  const dag = d.getDay() || 7;
  d.setDate(d.getDate() - (dag - 1));
  return d.toISOString().slice(0, 10);
}

export function relatieveTijd(isoDatum) {
  if (!isoDatum) return 'nog niet gedaan';

  const verschilMs = Date.now() - new Date(isoDatum).getTime();
  const dagen = Math.floor(verschilMs / (1000 * 60 * 60 * 24));

  if (dagen <= 0) return 'vandaag';
  if (dagen === 1) return 'gisteren';
  return `${dagen} dagen geleden`;
}
