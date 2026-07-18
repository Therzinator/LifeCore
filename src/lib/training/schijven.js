const SCHIJVEN = [20, 10, 5, 2.5, 1.25];
const STANG_RECHT_STD = 20;
const STANG_CURL_STD = 10;

export function berekenSchijven(totaalGewicht, stangType = 'recht', instStangen = {}) {
  const stangGewicht = stangType === 'curl'
    ? (instStangen.stangCurl ?? STANG_CURL_STD)
    : (instStangen.stangRecht ?? STANG_RECHT_STD);
  let perKant = (totaalGewicht - stangGewicht) / 2;

  const schijven = [];
  if (perKant > 0) {
    for (const schijf of SCHIJVEN) {
      let aantal = 0;
      while (perKant >= schijf - 0.001) {
        perKant = Math.round((perKant - schijf) * 100) / 100;
        aantal++;
      }
      if (aantal > 0) schijven.push({ gewicht: schijf, aantal });
    }
  }

  const totaalCheck = stangGewicht + schijven.reduce((som, s) => som + s.gewicht * s.aantal * 2, 0);
  const ok = Math.abs(totaalCheck - totaalGewicht) < 0.05;

  return { ok, stangGewicht, schijven, totaalCheck };
}
