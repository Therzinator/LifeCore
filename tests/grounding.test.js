import { describe, it, expect } from 'vitest';
import { GROUNDING_VRAGEN } from '../src/lib/mindfulness/grounding.js';

describe('grounding', () => {
  it('heeft precies 5 vragen', () => {
    expect(GROUNDING_VRAGEN).toHaveLength(5);
  });

  it('telt af van 5 naar 1', () => {
    expect(GROUNDING_VRAGEN.map((v) => v.num)).toEqual([5, 4, 3, 2, 1]);
  });

  it('elke vraag heeft een vraag- en hint-tekst', () => {
    for (const v of GROUNDING_VRAGEN) {
      expect(v.vraag).toBeTruthy();
      expect(v.hint).toBeTruthy();
      expect(v.zintuig).toBeTruthy();
    }
  });
});
