import { describe, it, expect } from 'vitest';
import { berekenGecommitteerdeWaarde } from '../src/utils/getalVeld.js';

describe('berekenGecommitteerdeWaarde', () => {
  it('parseert een geldig geheel getal', () => {
    expect(berekenGecommitteerdeWaarde('42', { geheel: true })).toBe(42);
  });

  it('parseert een geldig kommagetal', () => {
    expect(berekenGecommitteerdeWaarde('2.5', { geheel: false })).toBe(2.5);
  });

  it('valt terug op fallback bij een lege string', () => {
    expect(berekenGecommitteerdeWaarde('', { fallback: 90 })).toBe(90);
  });

  it('valt terug op fallback bij alleen een minteken', () => {
    expect(berekenGecommitteerdeWaarde('-', { fallback: 5 })).toBe(5);
  });

  it('valt terug op fallback bij ongeldige tekst', () => {
    expect(berekenGecommitteerdeWaarde('abc', { fallback: 3 })).toBe(3);
  });

  it('klemt aan de ondergrens', () => {
    expect(berekenGecommitteerdeWaarde('-10', { min: 0, fallback: 0 })).toBe(0);
  });

  it('klemt aan de bovengrens', () => {
    expect(berekenGecommitteerdeWaarde('500', { max: 99 })).toBe(99);
  });

  it('staat negatieve waarden toe als er geen ondergrens is opgegeven', () => {
    expect(berekenGecommitteerdeWaarde('-5', { geheel: true })).toBe(-5);
  });

  it('rondt niet af maar trunceert bij geheel:true (parseInt-gedrag)', () => {
    expect(berekenGecommitteerdeWaarde('3.9', { geheel: true })).toBe(3);
  });
});
