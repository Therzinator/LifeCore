export const MBI_SUBSCHALEN = [
  {
    id: 'uitputting',
    label: 'Uitputting',
    richting: 'negatief',
    items: [
      'Ik voel me aan het einde van de dag leeg.',
      'Ik heb het gevoel dat ik mezelf moet opjagen om aan de dag te beginnen.',
      'Mijn dagelijkse verplichtingen voelen zwaarder dan ze zouden moeten.',
    ],
  },
  {
    id: 'cynisme',
    label: 'Cynisme / distantie',
    richting: 'negatief',
    items: [
      'Ik voel me minder betrokken bij wat ik doe dan vroeger.',
      'Ik twijfel of wat ik doe nog wel zin heeft.',
      'Ik voel me afstandelijk ten opzichte van mensen om me heen.',
    ],
  },
  {
    id: 'effectiviteit',
    label: 'Effectiviteit',
    richting: 'positief',
    items: [
      'Ik heb het gevoel dat ik dingen voor elkaar krijg.',
      'Ik ben trots op wat ik doe.',
      'Ik voel me capabel om met mijn taken om te gaan.',
    ],
  },
];

export function berekenScores(antwoorden) {
  const scores = {};
  for (const sub of MBI_SUBSCHALEN) {
    const waarden = sub.items
      .map((_, i) => antwoorden[`${sub.id}:${i}`])
      .filter((v) => typeof v === 'number');
    scores[sub.id] = waarden.length ? waarden.reduce((a, b) => a + b, 0) / waarden.length : null;
  }
  return scores;
}
