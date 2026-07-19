import { datumKey } from '../../utils/datum.js';

// Verplaatst een 'HH:MM'-tijd met deltaMinuten, met wrap-around binnen een
// etmaal (bv. 23:30 + 60min -> 00:30). Gedeeld tussen het blok-formulier
// (AgendaBlokForm) en de Klusjes-dag-suggesties (AgendaDag), vandaar hier
// i.p.v. lokaal in één component.
export function pasTijdAan(tijd, deltaMinuten) {
  const [uur, minuut] = tijd.split(':').map(Number);
  const totaal = (((uur * 60 + minuut + deltaMinuten) % (24 * 60)) + 24 * 60) % (24 * 60);
  const nieuwUur = String(Math.floor(totaal / 60)).padStart(2, '0');
  const nieuwMinuut = String(totaal % 60).padStart(2, '0');
  return `${nieuwUur}:${nieuwMinuut}`;
}

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
