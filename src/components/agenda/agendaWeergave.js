// Gedeelde weergave-constanten voor de Agenda-componenten.
export const TYPE_ICOON = {
  kracht: '🏋', ontspanning: '🧘', klusjes: '🔧', werk: '💼', sociaal: '❤️', eigenbedrijf: '🌱', overig: '📌',
  lift: '🏋', cardio: '🚣', werkdag: '💼', vrij: '🌴', welzijn: '🧭', project: '🔧', klusjesdag: '🔧',
};

// Ad-hoc Agenda-bloktype -> module-id — voor de 'Start sessie'-link in de
// dagweergave, zodat een kracht/cardio-blok niet alleen een kalendernotitie
// is maar ook echt doorlinkt naar waar je 'm kan uitvoeren/loggen. 'klusjes'/
// 'werk' linken naar de Werk-module (bevat Werktaken/Huishouden/Kluslijst).
export const BLOK_TYPE_MODULE = { kracht: 'training', cardio: 'cardio', klusjes: 'werk', werk: 'werk' };
