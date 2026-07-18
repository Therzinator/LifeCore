import { describe, it, expect } from 'vitest';
import { WELZIJN_SUBSCHALEN, berekenScores, volgendeCheckDatum, checkIsVerschuldigd } from '../src/lib/welzijn/vragenset.js';

describe('WELZIJN_SUBSCHALEN', () => {
  it('combineert de 2 CBI- en 4 REQ-subschalen tot 6 subschalen', () => {
    expect(WELZIJN_SUBSCHALEN).toHaveLength(6);
    expect(WELZIJN_SUBSCHALEN.map((s) => s.id)).toEqual([
      'persoonlijk', 'werk', 'onthechting', 'ontspanning', 'mastery', 'controle',
    ]);
  });
});

describe('berekenScores', () => {
  it('berekent het gemiddelde per subschaal', () => {
    const antwoorden = {
      'persoonlijk:0': 3, 'persoonlijk:1': 3, 'persoonlijk:2': 3, 'persoonlijk:3': 3, 'persoonlijk:4': 3,
      'werk:0': 0, 'werk:1': 0, 'werk:2': 0, 'werk:3': 0, 'werk:4': 0,
      'onthechting:0': 2, 'onthechting:1': 2,
      'ontspanning:0': 2, 'ontspanning:1': 2,
      'mastery:0': 2, 'mastery:1': 2,
      'controle:0': 2, 'controle:1': 2,
    };
    const scores = berekenScores(antwoorden);
    expect(scores.persoonlijk).toBe(3);
    expect(scores.werk).toBe(0);
  });

  it('berekent de samengestelde herstelscore als gemiddelde van de 4 REQ-subschalen', () => {
    const antwoorden = {
      'onthechting:0': 3, 'onthechting:1': 3,
      'ontspanning:0': 1, 'ontspanning:1': 1,
      'mastery:0': 0, 'mastery:1': 0,
      'controle:0': 0, 'controle:1': 0,
    };
    const scores = berekenScores(antwoorden);
    // (3 + 1 + 0 + 0) / 4 = 1
    expect(scores.herstel).toBe(1);
  });

  it('geeft null voor subschalen zonder beantwoorde items, inclusief herstel', () => {
    const scores = berekenScores({});
    expect(scores.persoonlijk).toBeNull();
    expect(scores.herstel).toBeNull();
  });
});

describe('cadans', () => {
  it('checkIsVerschuldigd is true zonder eerdere afname', () => {
    expect(checkIsVerschuldigd(null)).toBe(true);
  });

  it('checkIsVerschuldigd is false binnen 14 dagen na de laatste afname', () => {
    const gisteren = new Date();
    gisteren.setDate(gisteren.getDate() - 1);
    expect(checkIsVerschuldigd(gisteren.toISOString())).toBe(false);
  });

  it('checkIsVerschuldigd is true 14+ dagen na de laatste afname', () => {
    const vijftienDagenGeleden = new Date();
    vijftienDagenGeleden.setDate(vijftienDagenGeleden.getDate() - 15);
    expect(checkIsVerschuldigd(vijftienDagenGeleden.toISOString())).toBe(true);
  });

  it('volgendeCheckDatum telt 14 dagen op bij de laatste afname', () => {
    const volgende = volgendeCheckDatum('2026-01-01T00:00:00.000Z');
    expect(volgende.toISOString().slice(0, 10)).toBe('2026-01-15');
  });
});
