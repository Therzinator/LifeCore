import { describe, it, expect } from 'vitest';
import { FASES, cyclusDuur, totaleDuur, faseOpTijdstip } from '../src/lib/ochtend/ademhaling.js';

describe('ademhaling 4-4-6', () => {
  it('heeft de juiste faseduren', () => {
    expect(FASES.map((f) => f.duur)).toEqual([4, 4, 6]);
  });

  it('een cyclus duurt 14 seconden', () => {
    expect(cyclusDuur()).toBe(14);
  });

  it('totaleDuur schaalt met het aantal cycli', () => {
    expect(totaleDuur(4)).toBe(56);
  });

  it('start in de inademen-fase op t=0', () => {
    const fase = faseOpTijdstip(0);
    expect(fase.naam).toBe('inademen');
    expect(fase.resterend).toBe(4);
    expect(fase.cyclusIndex).toBe(0);
  });

  it('zit in vasthouden-fase op t=5', () => {
    const fase = faseOpTijdstip(5);
    expect(fase.naam).toBe('vasthouden');
    expect(fase.secondenInFase).toBe(1);
  });

  it('zit in uitademen-fase op t=9', () => {
    const fase = faseOpTijdstip(9);
    expect(fase.naam).toBe('uitademen');
    expect(fase.resterend).toBe(5);
  });

  it('gaat naar de volgende cyclus na 14 seconden', () => {
    const fase = faseOpTijdstip(14);
    expect(fase.naam).toBe('inademen');
    expect(fase.cyclusIndex).toBe(1);
  });

  it('berekent de juiste cyclusIndex bij grotere tijdstippen', () => {
    const fase = faseOpTijdstip(30);
    expect(fase.cyclusIndex).toBe(2);
    expect(fase.naam).toBe('inademen');
    expect(fase.secondenInFase).toBe(2);
  });
});
