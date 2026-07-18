import { describe, it, expect } from 'vitest';
import { REK_OEFENINGEN, energieHint } from '../src/lib/ochtend/activering.js';

describe('REK_OEFENINGEN', () => {
  it('heeft 8 korte oefeningen, elk met naam, uitleg en duur', () => {
    expect(REK_OEFENINGEN).toHaveLength(8);
    for (const oef of REK_OEFENINGEN) {
      expect(oef.naam).toBeTruthy();
      expect(oef.uitleg).toBeTruthy();
      expect(oef.duur).toBeTruthy();
    }
  });
});

describe('energieHint', () => {
  it('geeft een passende hint per energieniveau', () => {
    expect(energieHint('laag')).toMatch(/rek/i);
    expect(energieHint('hoog')).toMatch(/volledige routine/i);
  });

  it('geeft null zonder bekend energieniveau', () => {
    expect(energieHint(undefined)).toBeNull();
    expect(energieHint('onbekend')).toBeNull();
  });
});
