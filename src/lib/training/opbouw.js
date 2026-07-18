const STANG_RECHT = 20;
const STANG_CURL = 10;

export function berekenOpbouwsets(werkgewicht, stangType = 'recht', gewichtStap = 2.5) {
  const stangGewicht = stangType === 'curl' ? STANG_CURL : STANG_RECHT;
  const rond = (g) => Math.round(g / gewichtStap) * gewichtStap;

  const kandidaten = [
    { gewicht: stangGewicht, reps: 5, label: 'Lege stang' },
    { gewicht: rond(werkgewicht * 0.4), reps: 5, label: '40%' },
    { gewicht: rond(werkgewicht * 0.6), reps: 3, label: '60%' },
    { gewicht: rond(werkgewicht * 0.8), reps: 2, label: '80%' },
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
