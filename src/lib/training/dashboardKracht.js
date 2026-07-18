import { bereken1RM } from './progressie.js';
import { maandagVan } from '../../utils/datum.js';

// Combineert alle getrainde oefeningen tot één "sterkte-totaal" per periode —
// som van de geschatte 1RM's (Epley) van het zwaarste gewicht per oefening
// die periode. Bewuste keuze voor één samengevoegde lijn i.p.v. een aparte
// grafiek per lift, zoals gevraagd.
function hoogsteRmPerOefening(sessies, periodeSleutel) {
  const perPeriode = {};
  sessies.forEach((sessie) => {
    const periode = periodeSleutel(sessie.datum);
    if (!perPeriode[periode]) perPeriode[periode] = {};
    (sessie.oefeningen || []).forEach((o) => {
      const rm = bereken1RM(o.gewicht, o.reps || 5);
      if (!perPeriode[periode][o.id] || rm > perPeriode[periode][o.id]) perPeriode[periode][o.id] = rm;
    });
  });
  return perPeriode;
}

function maandVan(datumIso) {
  return datumIso.slice(0, 7);
}

function totalenUit(perPeriode) {
  const labels = Object.keys(perPeriode).sort();
  const totalen = labels.map((p) => Object.values(perPeriode[p]).reduce((som, rm) => som + rm, 0));
  return { labels, totalen };
}

export function krachtPerWeek(sessies) {
  return totalenUit(hoogsteRmPerOefening(sessies, maandagVan));
}

export function krachtPerMaand(sessies) {
  return totalenUit(hoogsteRmPerOefening(sessies, maandVan));
}
