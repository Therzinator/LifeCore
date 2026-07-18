import { describe, it, expect } from 'vitest';
import { WAARDEN, waardeById } from '../src/lib/act/waarden.js';

describe('waarden', () => {
  it('is niet leeg', () => {
    expect(WAARDEN.length).toBeGreaterThan(0);
  });

  it('heeft unieke ids', () => {
    const ids = WAARDEN.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('elke waarde heeft label en omschrijving', () => {
    for (const w of WAARDEN) {
      expect(w.label).toBeTruthy();
      expect(w.omschrijving).toBeTruthy();
    }
  });

  it('waardeById vindt een bestaande waarde', () => {
    const eerste = WAARDEN[0];
    expect(waardeById(eerste.id)).toEqual(eerste);
  });

  it('waardeById geeft null voor onbekend id', () => {
    expect(waardeById('bestaat-niet')).toBeNull();
  });
});
