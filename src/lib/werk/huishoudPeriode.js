import { datumKey, maandagVan } from '../../utils/datum.js';

function maandKey(nu) {
  return `${nu.getFullYear()}-${String(nu.getMonth() + 1).padStart(2, '0')}`;
}

// Epoch-verankerde cyclus i.p.v. 'sinds laatst afgerond' — zo blijft een
// custom-interval-taak (bv. 'elke 10 dagen') een simpele periode-KEY net als
// week/maand, herbruikbaar in dezelfde log-structuur ({taakId: {periode:
// afgerond}}) i.p.v. een apart 'laatst afgerond op'-veld en eigen
// vervaldatum-berekening nodig te hebben.
function aangepastKey(nu, intervalDagen) {
  const dagenSindsEpoch = Math.floor(nu.getTime() / (1000 * 60 * 60 * 24));
  const cyclus = Math.floor(dagenSindsEpoch / intervalDagen);
  return `elke${intervalDagen}d_${cyclus}`;
}

// Puur seizoensvenster-filter (1-12, beide inclusief) — beide null betekent
// "heel jaar". Ondersteunt wrap-around (bv. maandVanaf: 11, maandTot: 2 voor
// "november t/m februari") door bij vanaf > tot de OR-vorm te gebruiken
// i.p.v. de normale AND-vorm.
export function inSeizoen(maandVanaf, maandTot, nu = new Date()) {
  if (maandVanaf == null || maandTot == null) return true;
  const maand = nu.getMonth() + 1;
  if (maandVanaf <= maandTot) return maand >= maandVanaf && maand <= maandTot;
  return maand >= maandVanaf || maand <= maandTot;
}

export function huidigePeriodeKey(frequentie, nu = new Date(), intervalDagen = null) {
  if (frequentie === 'maand') return maandKey(nu);
  if (frequentie === 'aangepast' && intervalDagen > 0) return aangepastKey(nu, intervalDagen);
  return maandagVan(nu);
}

// Eerste dag van de huidige cyclus van een 'aangepast'-interval-taak, als
// datumKey-string — dezelfde epoch-verankerde cyclusgrens als aangepastKey
// hierboven. Gebruikt om een 'standaard in agenda'-herhalend blok (zie
// ThuisPagina.jsx) exact op dezelfde dagen te laten vallen als het
// cyclus-signaal in agendaSignalen.js (huishoudTaakSignalen).
export function cyclusStartDatum(intervalDagen, nu = new Date()) {
  const dagenSindsEpoch = Math.floor(nu.getTime() / (1000 * 60 * 60 * 24));
  const cyclusStartDagen = Math.floor(dagenSindsEpoch / intervalDagen) * intervalDagen;
  return datumKey(new Date(cyclusStartDagen * 1000 * 60 * 60 * 24));
}

// Percentage afgerond voor de huidige periode (deze week/maand) — voor de
// checklist-graad in de Huishouden-tab zelf.
export function percentageAfgerond(taken, log, frequentie, nu = new Date()) {
  const relevant = taken.filter((t) => t.frequentie === frequentie);
  if (relevant.length === 0) return null;
  const periode = huidigePeriodeKey(frequentie, nu);
  const afgerond = relevant.filter((t) => log[t.id]?.[periode]).length;
  return { afgerond, totaal: relevant.length, percentage: Math.round((afgerond / relevant.length) * 100) };
}

// Percentage per week over de laatste N weken, óók voor weken zonder enige
// afgevinkte taak — een gemiste week levert een eerlijke 0% op i.p.v. dat
// de week gewoon niet verschijnt. Geschiedenis blijft zo altijd zichtbaar.
export function percentagePerWeek(taken, log, weken = 12, nu = new Date()) {
  const weekTaken = taken.filter((t) => t.frequentie === 'week');
  if (weekTaken.length === 0) return { labels: [], percentages: [] };

  const huidigeMaandag = new Date(huidigePeriodeKey('week', nu));
  const labels = [];
  for (let i = weken - 1; i >= 0; i--) {
    const d = new Date(huidigeMaandag);
    d.setDate(d.getDate() - i * 7);
    labels.push(datumKey(d));
  }

  const percentages = labels.map((week) => {
    const afgerond = weekTaken.filter((t) => log[t.id]?.[week]).length;
    return Math.round((afgerond / weekTaken.length) * 100);
  });

  return { labels, percentages };
}
