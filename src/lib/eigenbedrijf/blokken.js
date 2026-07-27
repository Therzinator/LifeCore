// Pure logica voor de vaste TJB Solutions-weekblokken (Eigen bedrijf).
// Geen React, geen opslag — leest alleen het 'blokken'-veld uit
// useEigenBedrijfInstellingen.js. dagNr is ISO-weekdagnummer (1=ma..7=zo),
// zelfde conventie als werkdagen/klusjesDag in useWerkInstellingen.js.

// 'toets' is het zondag-toetsmoment zelf (zie EigenBedrijfToets.jsx) — geen
// werktijd, telt dus bewust niet mee in duur-/minutentotalen. 'flexibel' is
// het zaterdagblok: vrij te categoriseren, telt wél mee als geplande
// werktijd (zie werkTotaal), maar niet als een eigen 'facturabel'/'platform'-
// potje omdat de gebruiker per sessie zelf bepaalt wat het was.
export const WERK_SOORTEN = ['facturabel', 'platform', 'flexibel'];

export function duurMinuten(start, eind) {
  const [uStart, mStart] = start.split(':').map(Number);
  const [uEind, mEind] = eind.split(':').map(Number);
  const totaalStart = uStart * 60 + mStart;
  const totaalEind = uEind * 60 + mEind;
  // Geen wrap-around nodig — alle blokken liggen binnen één kalenderdag
  // (net als agenda-blokken normaal), dus een eindtijd vóór de starttijd is
  // gewoon een ongeldige invoer, geen blok dat over middernacht heen loopt.
  return Math.max(0, totaalEind - totaalStart);
}

// dagIndex is 0=ma..6=zo (dagIndexVan-conventie uit utils/datum.js) — dus
// dagNr - 1, niet dagNr zelf.
export function blokkenVoorDagIndex(blokken, dagIndex) {
  return (blokken ?? []).filter((b) => b.dagNr - 1 === dagIndex);
}

// Totaal geplande minuten per soort, over één week — bron van waarheid voor
// het gepland-vs-gelogd-overzicht (EigenBedrijf.jsx) en voor het
// overschrijdingssignaal (koppeling6_eigenBedrijfOverschrijding).
export function geplandeMinuten(blokken) {
  const totalen = { facturabel: 0, platform: 0, flexibel: 0 };
  (blokken ?? []).forEach((b) => {
    if (b.soort === 'toets') return;
    if (!(b.soort in totalen)) return;
    totalen[b.soort] += duurMinuten(b.start, b.eind);
  });
  return { ...totalen, werkTotaal: totalen.facturabel + totalen.platform + totalen.flexibel };
}
