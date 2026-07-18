import { describe, it, expect } from 'vitest';
import { MBI_SUBSCHALEN, berekenScores } from '../src/lib/welzijn/mbi.js';

describe('mbi berekenScores', () => {
  it('heeft drie subschalen van elk drie items', () => {
    expect(MBI_SUBSCHALEN).toHaveLength(3);
    for (const sub of MBI_SUBSCHALEN) {
      expect(sub.items).toHaveLength(3);
    }
  });

  it('berekent het gemiddelde per subschaal', () => {
    const antwoorden = {
      'uitputting:0': 3, 'uitputting:1': 3, 'uitputting:2': 3,
      'cynisme:0': 0, 'cynisme:1': 0, 'cynisme:2': 0,
      'effectiviteit:0': 1, 'effectiviteit:1': 2, 'effectiviteit:2': 3,
    };
    const scores = berekenScores(antwoorden);
    expect(scores.uitputting).toBe(3);
    expect(scores.cynisme).toBe(0);
    expect(scores.effectiviteit).toBe(2);
  });

  it('geeft null voor een subschaal zonder beantwoorde items', () => {
    const scores = berekenScores({});
    expect(scores.uitputting).toBeNull();
    expect(scores.cynisme).toBeNull();
    expect(scores.effectiviteit).toBeNull();
  });

  it('negeert onbeantwoorde items binnen een subschaal', () => {
    const scores = berekenScores({ 'uitputting:0': 2 });
    expect(scores.uitputting).toBe(2);
  });
});
