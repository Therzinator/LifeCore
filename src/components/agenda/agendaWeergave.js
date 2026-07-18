// Gedeelde weergave-constanten voor de Agenda-componenten.
export const TYPE_ICOON = {
  kracht: '🏋', ontspanning: '🧘', sport: '🏃', sociaal: '❤️', eigenbedrijf: '🌱', overig: '📌',
  lift: '🏋', cardio: '🚣', werkdag: '💼', vrij: '🌴', welzijn: '🧭', project: '🔧',
};

// Ad-hoc Agenda-bloktype -> module-id — voor de 'Start sessie'-link in de
// dagweergave, zodat een kracht/cardio-blok niet alleen een kalendernotitie
// is maar ook echt doorlinkt naar waar je 'm kan uitvoeren/loggen.
export const BLOK_TYPE_MODULE = { kracht: 'training', cardio: 'cardio' };
