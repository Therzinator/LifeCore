import { describe, it, expect } from 'vitest';
import { berekenSchijven } from '../src/lib/training/schijven.js';

describe('berekenSchijven', () => {
  it('berekent twee 20kg-schijven voor 100kg', () => {
    const resultaat = berekenSchijven(100, 'recht');
    expect(resultaat.ok).toBe(true);
    expect(resultaat.stangGewicht).toBe(20);
    expect(resultaat.schijven).toEqual([{ gewicht: 20, aantal: 2 }]);
  });

  it('berekent een gemengde schijfverdeling exact', () => {
    const resultaat = berekenSchijven(47.5, 'recht');
    expect(resultaat.ok).toBe(true);
    expect(resultaat.schijven).toEqual([
      { gewicht: 10, aantal: 1 },
      { gewicht: 2.5, aantal: 1 },
      { gewicht: 1.25, aantal: 1 },
    ]);
  });

  it('geeft een lege schijvenlijst voor een lege stang', () => {
    const resultaat = berekenSchijven(20, 'recht');
    expect(resultaat.ok).toBe(true);
    expect(resultaat.schijven).toEqual([]);
  });

  it('gebruikt de curl-stang bij stangType curl', () => {
    const resultaat = berekenSchijven(30, 'curl');
    expect(resultaat.ok).toBe(true);
    expect(resultaat.stangGewicht).toBe(10);
    expect(resultaat.schijven).toEqual([{ gewicht: 10, aantal: 1 }]);
  });

  it('markeert een niet-maakbaar gewicht als niet ok', () => {
    const resultaat = berekenSchijven(21, 'recht');
    expect(resultaat.ok).toBe(false);
  });

  it('markeert een gewicht lichter dan de stang als niet ok', () => {
    const resultaat = berekenSchijven(15, 'recht');
    expect(resultaat.ok).toBe(false);
  });
});
