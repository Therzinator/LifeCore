const STANG_RECHT_STD = 20;
const STANG_CURL_STD = 10;

export function berekenOpbouwsets(werkgewicht, stangType = 'recht', gewichtStap = 2.5, instStangen = {}) {
  const stangGewicht = stangType === 'curl'
    ? (instStangen.stangCurl ?? STANG_CURL_STD)
    : (instStangen.stangRecht ?? STANG_RECHT_STD);
  const rond = (g) => Math.round(g / gewichtStap) * gewichtStap;

  const kandidaten = [
    { label: 'Lege stang', gewicht: stangGewicht, reps: 5 },
    { label: '40%', gewicht: rond(werkgewicht * 0.4), reps: 5 },
    { label: '60%', gewicht: rond(werkgewicht * 0.6), reps: 3 },
    { label: '80%', gewicht: rond(werkgewicht * 0.8), reps: 2 },
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
