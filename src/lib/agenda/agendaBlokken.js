import { datumKey } from '../../utils/datum.js';

// Zet lokale planningsblokken om naar concrete data-instanties binnen een
// gegeven bereik — een blok met herhaling: 'wekelijks' is één opgeslagen
// record, maar levert meerdere zichtbare instanties op (één per week).
// Bereikgrenzen zijn 'YYYY-MM-DD'-strings (inclusief).
function instantieDatumsVoorBlok(blok, bereikStart, bereikEind) {
  if (!blok.herhaling) {
    return (blok.datum >= bereikStart && blok.datum <= bereikEind) ? [blok.datum] : [];
  }

  const basis = new Date(blok.datum);
  const start = new Date(bereikStart);
  const eind = new Date(bereikEind);

  let cursor = new Date(basis);
  if (cursor < start) {
    const dagenVerschil = Math.floor((start - basis) / (1000 * 60 * 60 * 24));
    const wekenVerschil = Math.ceil(dagenVerschil / 7);
    cursor = new Date(basis);
    cursor.setDate(cursor.getDate() + wekenVerschil * 7);
  }

  const datums = [];
  while (cursor <= eind) {
    datums.push(datumKey(cursor));
    cursor.setDate(cursor.getDate() + 7);
  }
  return datums;
}

export function instantiesInBereik(blokken, bereikStart, bereikEind) {
  return blokken
    .flatMap((blok) => instantieDatumsVoorBlok(blok, bereikStart, bereikEind).map((datum) => ({ ...blok, datum })))
    .sort((a, b) => (a.datum + a.starttijd).localeCompare(b.datum + b.starttijd));
}
