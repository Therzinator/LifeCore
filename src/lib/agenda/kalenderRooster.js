import { maandagVan } from '../../utils/datum.js';

// Genereert een volledig kalenderrooster voor een maand: altijd hele weken
// (maandag t/m zondag), inclusief de dagen uit de vorige/volgende maand die
// nodig zijn om de eerste/laatste week te vullen — het standaardpatroon
// voor een maandgrid.
export function maandRooster(jaar, maand) {
  const eersteDagVanMaand = new Date(jaar, maand - 1, 1);
  const laatsteDagVanMaand = new Date(jaar, maand, 0);

  const start = new Date(maandagVan(eersteDagVanMaand.toISOString()));
  const eindMaandag = new Date(maandagVan(laatsteDagVanMaand.toISOString()));
  const eind = new Date(eindMaandag);
  eind.setDate(eind.getDate() + 6);

  const weken = [];
  const cursor = new Date(start);
  while (cursor <= eind) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push({
        datum: cursor.toISOString().slice(0, 10),
        inMaand: cursor.getMonth() === maand - 1,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weken.push(week);
  }
  return weken;
}

export function weekDatums(referentieDatumIso) {
  const maandag = maandagVan(referentieDatumIso);
  const datums = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(maandag);
    d.setDate(d.getDate() + i);
    datums.push(d.toISOString().slice(0, 10));
  }
  return datums;
}
