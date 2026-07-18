import { describe, it, expect } from 'vitest';
import { PMR_SPIEREN, faseOpTijdstip, totaleDuur } from '../src/lib/mindfulness/pmr.js';

describe('pmr', () => {
  it('heeft 8 spiergroepen van elk 5s span + 10s los', () => {
    expect(PMR_SPIEREN).toHaveLength(8);
    for (const groep of PMR_SPIEREN) {
      expect(groep.span).toBe(5);
      expect(groep.los).toBe(10);
    }
  });

  it('totaleDuur is 8 x 15 = 120 seconden', () => {
    expect(totaleDuur()).toBe(120);
  });

  it('start in de span-fase van de eerste spiergroep', () => {
    const fase = faseOpTijdstip(0);
    expect(fase.spierIndex).toBe(0);
    expect(fase.fase).toBe('span');
    expect(fase.resterend).toBe(5);
  });

  it('gaat na 5 seconden naar de los-fase van dezelfde groep', () => {
    const fase = faseOpTijdstip(5);
    expect(fase.spierIndex).toBe(0);
    expect(fase.fase).toBe('los');
    expect(fase.secondenInFase).toBe(0);
    expect(fase.resterend).toBe(10);
  });

  it('gaat na 15 seconden naar de tweede spiergroep', () => {
    const fase = faseOpTijdstip(15);
    expect(fase.spierIndex).toBe(1);
    expect(fase.fase).toBe('span');
  });

  it('geeft null na afloop van alle spiergroepen', () => {
    expect(faseOpTijdstip(120)).toBeNull();
    expect(faseOpTijdstip(121)).toBeNull();
  });

  it('geeft de juiste groep vlak voor het einde', () => {
    const fase = faseOpTijdstip(119);
    expect(fase.spierIndex).toBe(7);
    expect(fase.fase).toBe('los');
    expect(fase.resterend).toBe(1);
  });
});
