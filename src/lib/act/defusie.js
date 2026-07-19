// Drie defusietechnieken naast elkaar (i.p.v. één vaste) — mensen reageren
// verschillend op elke vorm, en het is expliciet gevraagd om varianten te
// bieden i.p.v. één techniek als enige optie op te leggen.
export const DEFUSIE_TECHNIEKEN = [
  {
    id: 'labelen',
    label: 'Gedachte labelen',
    omschrijving: 'Herformuleer de gedachte als iets wat je hebt, niet iets wat waar is.',
  },
  {
    id: 'wolk',
    label: 'Wolk laten wegdrijven',
    omschrijving: 'Stel je de gedachte voor als een wolk die vanzelf verder drijft.',
  },
  {
    id: 'zoomout',
    label: 'Zoom uit',
    omschrijving: 'Bekijk jezelf en de gedachte van steeds verder weg.',
  },
];

function labelenStappen(schoon) {
  const kaal = schoon.replace(/[.!?]+$/, '');
  const verlaagd = kaal.charAt(0).toLowerCase() + kaal.slice(1);
  return [
    { label: 'De gedachte', tekst: schoon },
    { label: 'Een stap terug', tekst: `Ik heb de gedachte dat ${verlaagd}.` },
    { label: 'Nog een stap terug', tekst: `Ik merk dat ik de gedachte heb dat ${verlaagd}.` },
  ];
}

function wolkStappen(schoon) {
  return [
    { label: 'De gedachte', tekst: schoon },
    { label: 'Zet hem op een wolk', tekst: 'Stel je deze gedachte voor als tekst op een wolk aan de hemel. Je hoeft de wolk niet vast te pakken — kijk er gewoon naar.' },
    { label: 'Laat hem wegdrijven', tekst: 'De wind neemt de wolk mee. Hij wordt langzaam kleiner en drijft verder, tot hij uit het zicht verdwijnt — je hoeft er niets voor te doen.' },
  ];
}

function zoomOutStappen(schoon) {
  return [
    { label: 'De gedachte', tekst: schoon },
    { label: 'Zoom uit', tekst: 'Doe in gedachten een stap naar achteren en bekijk jezelf, met deze gedachte, van een afstandje — alsof je naar een foto kijkt.' },
    { label: 'Nog verder uit', tekst: 'Zoom nog verder uit: jezelf van bovenaf, ergens in je dag, ergens in je week. Hoe groot is de gedachte nog, gezien vanaf hier?' },
  ];
}

const GENERATORS = { labelen: labelenStappen, wolk: wolkStappen, zoomout: zoomOutStappen };

export function defusieStappen(gedachte, techniekId = 'labelen') {
  const schoon = (gedachte ?? '').trim();
  if (!schoon) return [];
  const genereer = GENERATORS[techniekId] ?? labelenStappen;
  return genereer(schoon);
}
