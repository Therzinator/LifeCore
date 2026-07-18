export function vandaagKey() {
  const d = new Date();
  const jaar = d.getFullYear();
  const maand = String(d.getMonth() + 1).padStart(2, '0');
  const dag = String(d.getDate()).padStart(2, '0');
  return `${jaar}-${maand}-${dag}`;
}

export function relatieveTijd(isoDatum) {
  if (!isoDatum) return 'nog niet gedaan';

  const verschilMs = Date.now() - new Date(isoDatum).getTime();
  const dagen = Math.floor(verschilMs / (1000 * 60 * 60 * 24));

  if (dagen <= 0) return 'vandaag';
  if (dagen === 1) return 'gisteren';
  return `${dagen} dagen geleden`;
}
