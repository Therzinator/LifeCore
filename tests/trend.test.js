import { describe, it, expect } from 'vitest';
import { momentopnameTekst, zachteTrend } from '../src/lib/welzijn/trend.js';

const SUBSCHALEN = [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }];

const OORDELENDE_WOORDEN = /slecht|fout|verkeerd|zorgwekkend|alarmerend|falen/i;

describe('momentopnameTekst', () => {
  it('geeft een neutrale tekst per bereik', () => {
    expect(momentopnameTekst(null)).toBe('Niet ingevuld.');
    expect(momentopnameTekst(0.5)).toMatch(/niet sterk/);
    expect(momentopnameTekst(1.5)).toMatch(/af en toe/);
    expect(momentopnameTekst(2.5)).toMatch(/sterk aanwezig/);
  });
});

describe('zachteTrend', () => {
  it('meldt een eerste meting zonder vorige score', () => {
    const resultaten = zachteTrend({ a: 2 }, null, SUBSCHALEN);
    expect(resultaten[0].trend).toMatch(/eerste meting/);
  });

  it('signaleert een stijging neutraal', () => {
    const resultaten = zachteTrend({ a: 2.5 }, { a: 1 }, SUBSCHALEN);
    expect(resultaten[0].trend).toMatch(/hoger/);
  });

  it('signaleert een daling neutraal', () => {
    const resultaten = zachteTrend({ a: 0.5 }, { a: 2 }, SUBSCHALEN);
    expect(resultaten[0].trend).toMatch(/lager/);
  });

  it('meldt gelijk bij een klein verschil', () => {
    const resultaten = zachteTrend({ a: 1.5 }, { a: 1.6 }, SUBSCHALEN);
    expect(resultaten[0].trend).toMatch(/hetzelfde/);
  });

  it('bevat nooit oordelende taal, ook niet bij de laagste/hoogste scores', () => {
    const gevallen = [
      zachteTrend({ a: 0 }, { a: 3 }, SUBSCHALEN),
      zachteTrend({ a: 3 }, { a: 0 }, SUBSCHALEN),
      zachteTrend({ a: 0 }, null, SUBSCHALEN),
    ];
    for (const resultaten of gevallen) {
      for (const r of resultaten) {
        expect(r.trend).not.toMatch(OORDELENDE_WOORDEN);
        expect(r.momentopname).not.toMatch(OORDELENDE_WOORDEN);
      }
    }
  });

  it('geeft geen trend als er geen antwoord is ingevuld', () => {
    const resultaten = zachteTrend({}, { a: 1 }, SUBSCHALEN);
    expect(resultaten[0].momentopname).toBe('Niet ingevuld.');
    expect(resultaten[0].trend).toBe('');
  });
});
