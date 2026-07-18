import { describe, it, expect } from 'vitest';
import { URGE_STAPPEN } from '../src/lib/mindfulness/urgeSurfing.js';

describe('urgeSurfing', () => {
  it('heeft precies 5 stappen', () => {
    expect(URGE_STAPPEN).toHaveLength(5);
  });

  it('begint met opmerken en eindigt met een bewuste keuze', () => {
    expect(URGE_STAPPEN[0].fase).toBe('Merk op');
    expect(URGE_STAPPEN[URGE_STAPPEN.length - 1].fase).toBe('Kies bewust');
  });

  it('elke stap heeft een instructie- en detailtekst', () => {
    for (const stap of URGE_STAPPEN) {
      expect(stap.instructie).toBeTruthy();
      expect(stap.detail).toBeTruthy();
    }
  });
});
