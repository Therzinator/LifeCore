import { describe, it, expect } from 'vitest';
import { FASES, cyclusDuur, faseOpTijdstip } from '../src/lib/mindfulness/meditatie.js';

describe('meditatie 6-6', () => {
  it('heeft twee gelijke fases van 6 seconden', () => {
    expect(FASES).toEqual([
      { naam: 'inademen', duur: 6 },
      { naam: 'uitademen', duur: 6 },
    ]);
  });

  it('een cyclus duurt 12 seconden', () => {
    expect(cyclusDuur()).toBe(12);
  });

  it('start in de inademen-fase', () => {
    const fase = faseOpTijdstip(0);
    expect(fase.naam).toBe('inademen');
    expect(fase.resterend).toBe(6);
  });

  it('gaat na 6 seconden naar uitademen', () => {
    const fase = faseOpTijdstip(6);
    expect(fase.naam).toBe('uitademen');
    expect(fase.secondenInFase).toBe(0);
  });

  it('herhaalt de cyclus na 12 seconden', () => {
    const fase = faseOpTijdstip(12);
    expect(fase.naam).toBe('inademen');
    expect(fase.cyclusIndex).toBe(1);
  });
});
