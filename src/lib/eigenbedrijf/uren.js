import { maandagVan } from '../../utils/datum.js';

// Som gelogde minuten per categorie voor één specifieke week (weekMaandag =
// een 'YYYY-MM-DD'-maandag, zoals geproduceerd door maandagVan) — gebruikt
// voor het gepland-vs-gelogd-overzicht (EigenBedrijf.jsx) en het
// zondag-toetsmoment (dat exact de lopende week wil zien).
export function weekTotalen(sessies, weekMaandag) {
  const vanDeWeek = (sessies ?? []).filter((s) => maandagVan(s.datum) === weekMaandag);
  const facturabel = vanDeWeek.filter((s) => s.categorie === 'facturabel').reduce((som, s) => som + s.minuten, 0);
  const platform = vanDeWeek.filter((s) => s.categorie === 'platform').reduce((som, s) => som + s.minuten, 0);
  return { facturabel, platform, totaal: facturabel + platform };
}

// Weekreeks van gelogde minuten per categorie — zelfde vorm/conventie als
// lib/cardio/checklist.js#checklistPerWeek: een week zonder gelogde sessies
// levert simpelweg geen entry op (geen zero-fill), dus een gemiste week is
// een gat in de grafiek, geen zichtbare "0" — geschiedenis blijft altijd
// zichtbaar, nooit als falen gemarkeerd.
export function urenPerWeek(sessies, weken = 12) {
  const perWeek = {};
  (sessies ?? []).forEach((s) => {
    if (s.categorie !== 'facturabel' && s.categorie !== 'platform') return;
    const week = maandagVan(s.datum);
    perWeek[week] ??= { facturabel: 0, platform: 0 };
    perWeek[week][s.categorie] += s.minuten;
  });

  const labels = Object.keys(perWeek).sort().slice(-weken);
  const facturabelPerWeek = labels.map((w) => perWeek[w].facturabel);
  const platformPerWeek = labels.map((w) => perWeek[w].platform);
  return { labels, facturabelPerWeek, platformPerWeek };
}
