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

// Standaard interval-overlap-check op 'HH:MM'-strings — die vergelijken
// lexicografisch net zo correct als numeriek zolang ze altijd 2 cijfers
// hebben (zoals overal in dit project). [startA,eindA) overlapt met
// [startB,eindB) zodra startA vóór eindB ligt EN startB vóór eindA — het
// standaard-interval-overlap-criterium, geen zelfverzonnen heuristiek.
function tijdenOverlappen(startA, eindA, startB, eindB) {
  return startA < eindB && startB < eindA;
}

// Controleert of een kandidaat-blok (datum/starttijd/eindtijd) overlapt met
// een al bestaande blok-INSTANTIE op diezelfde datum — herhalende blokken
// worden dus ook meegenomen (via instantiesInBereik, die een wekelijkse
// herhaling al naar concrete datums vertaalt). negeerId sluit het blok zelf
// uit (nodig bij het bewerken van een bestaand blok — anders vlagt het
// zichzelf als conflict).
export function heeftOverlap(blokken, kandidaat, negeerId = null) {
  const instanties = instantiesInBereik(blokken, kandidaat.datum, kandidaat.datum);
  return instanties.some((b) => b.id !== negeerId && tijdenOverlappen(kandidaat.starttijd, kandidaat.eindtijd, b.starttijd, b.eindtijd));
}

// Zoekt vanaf de gewenste starttijd het eerstvolgende vrije tijdvak van
// duurMinuten op die datum, in stappen van stapMinuten. Gebruikt door de
// suggestie-'+ Toevoegen'-knoppen (Kluslijst/huishouden/mediteren/hond) —
// die hadden allemaal dezelfde vaste standaardtijd (bv. 10:00), wat na de
// invoering van heeftOverlap-validatie betekende dat de tweede suggestie op
// dezelfde dag altijd geweigerd werd. Schuift nu automatisch door naar de
// eerstvolgende vrije tijd i.p.v. te blokkeren. Loopt (met wrap-around via
// pasTijdAan) maximaal één volle dag rond als vangnet — geeft dan de
// oorspronkelijke gewenste tijd terug (zou in de praktijk nooit voorkomen).
export function volgendeVrijeTijd(blokken, datum, gewensteStarttijd, duurMinuten, stapMinuten = 15) {
  let starttijd = gewensteStarttijd;
  const maxPogingen = Math.ceil((24 * 60) / stapMinuten);
  for (let i = 0; i < maxPogingen; i += 1) {
    const eindtijd = pasTijdAan(starttijd, duurMinuten);
    if (!heeftOverlap(blokken, { datum, starttijd, eindtijd })) return starttijd;
    starttijd = pasTijdAan(starttijd, stapMinuten);
  }
  return gewensteStarttijd;
}
