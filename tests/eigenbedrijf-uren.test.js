import { describe, it, expect } from 'vitest';
import { weekTotalen, urenPerWeek } from '../src/lib/eigenbedrijf/uren.js';

// 2026-07-13 is een maandag.
const SESSIES = [
  { id: 1, datum: '2026-07-14', minuten: 90, categorie: 'facturabel', tekst: 'Bug X opgelost' },
  { id: 2, datum: '2026-07-16', minuten: 60, categorie: 'platform', tekst: 'Monorepo-werk' },
  { id: 3, datum: '2026-07-21', minuten: 45, categorie: 'facturabel', tekst: 'Volgende week' }, // week erna
];

describe('weekTotalen', () => {
  it('telt facturabel en platform apart voor de opgegeven week', () => {
    const totalen = weekTotalen(SESSIES, '2026-07-13');
    expect(totalen).toEqual({ facturabel: 90, platform: 60, totaal: 150 });
  });

  it('geeft nul-totalen voor een week zonder sessies', () => {
    expect(weekTotalen(SESSIES, '2026-06-01')).toEqual({ facturabel: 0, platform: 0, totaal: 0 });
  });
});

describe('urenPerWeek', () => {
  it('groepeert per week-maandag, gescheiden per categorie', () => {
    const { labels, facturabelPerWeek, platformPerWeek } = urenPerWeek(SESSIES);
    expect(labels).toEqual(['2026-07-13', '2026-07-20']);
    expect(facturabelPerWeek).toEqual([90, 45]);
    expect(platformPerWeek).toEqual([60, 0]);
  });

  it('geeft lege reeksen zonder sessies', () => {
    expect(urenPerWeek([])).toEqual({ labels: [], facturabelPerWeek: [], platformPerWeek: [] });
  });

  it('negeert sessies met een onbekende categorie', () => {
    const metOnbekend = [...SESSIES, { id: 4, datum: '2026-07-14', minuten: 30, categorie: 'flexibel' }];
    const { facturabelPerWeek } = urenPerWeek(metOnbekend);
    expect(facturabelPerWeek).toEqual([90, 45]);
  });
});
