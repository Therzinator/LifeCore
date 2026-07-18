export const REQ_DIMENSIES = [
  {
    id: 'onthechting',
    label: 'Onthechting',
    richting: 'positief',
    items: [
      'Ik kan mijn taken loslaten als de dag erop zit.',
      'Ik denk \'s avonds niet meer actief na over wat er nog moet gebeuren.',
    ],
  },
  {
    id: 'ontspanning',
    label: 'Ontspanning',
    richting: 'positief',
    items: [
      'Ik heb vandaag momenten gehad waarop ik echt ontspannen was.',
      'Mijn lichaam voelde vandaag op zijn minst één moment rustig aan.',
    ],
  },
  {
    id: 'mastery',
    label: 'Mastery',
    richting: 'positief',
    items: [
      'Ik heb vandaag iets gedaan waar ik nieuwe energie van kreeg.',
      'Ik heb vandaag iets geleerd of onder de knie gekregen.',
    ],
  },
  {
    id: 'controle',
    label: 'Controle',
    richting: 'positief',
    items: [
      'Ik had vandaag het gevoel zelf te kunnen kiezen wat ik deed in mijn vrije tijd.',
      'Ik voelde me vandaag niet opgejaagd door verplichtingen in mijn vrije tijd.',
    ],
  },
];

export function berekenScores(antwoorden) {
  const scores = {};
  for (const dim of REQ_DIMENSIES) {
    const waarden = dim.items
      .map((_, i) => antwoorden[`${dim.id}:${i}`])
      .filter((v) => typeof v === 'number');
    scores[dim.id] = waarden.length ? waarden.reduce((a, b) => a + b, 0) / waarden.length : null;
  }
  return scores;
}
