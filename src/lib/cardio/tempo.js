export function tempoNaarSec(tempo) {
  if (!tempo) return 0;
  const [min, sec] = tempo.split(':').map(Number);
  return (min || 0) * 60 + (sec || 0);
}

export function tempoLabel(sec) {
  if (!sec) return '—';
  const min = Math.floor(sec / 60);
  const rest = sec % 60;
  return `${min}:${String(rest).padStart(2, '0')}`;
}
