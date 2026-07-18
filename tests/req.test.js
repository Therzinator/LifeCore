import { describe, it, expect } from 'vitest';
import { REQ_DIMENSIES, berekenScores } from '../src/lib/welzijn/req.js';

describe('req berekenScores', () => {
  it('heeft vier dimensies van elk twee items', () => {
    expect(REQ_DIMENSIES).toHaveLength(4);
    for (const dim of REQ_DIMENSIES) {
      expect(dim.items).toHaveLength(2);
    }
  });

  it('berekent het gemiddelde per dimensie', () => {
    const antwoorden = {
      'onthechting:0': 2, 'onthechting:1': 0,
      'ontspanning:0': 3, 'ontspanning:1': 3,
      'mastery:0': 1, 'mastery:1': 1,
      'controle:0': 0, 'controle:1': 2,
    };
    const scores = berekenScores(antwoorden);
    expect(scores.onthechting).toBe(1);
    expect(scores.ontspanning).toBe(3);
    expect(scores.mastery).toBe(1);
    expect(scores.controle).toBe(1);
  });

  it('geeft null voor een dimensie zonder beantwoorde items', () => {
    const scores = berekenScores({});
    expect(scores.onthechting).toBeNull();
  });
});
