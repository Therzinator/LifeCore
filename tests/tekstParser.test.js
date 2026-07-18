import { describe, it, expect } from 'vitest';
import { parseSpraakTekst } from '../src/lib/werk/tekstParser.js';

describe('parseSpraakTekst', () => {
  it('splitst op komma\'s', () => {
    expect(parseSpraakTekst('mail beantwoorden, vergadering voorbereiden')).toEqual([
      'mail beantwoorden', 'vergadering voorbereiden',
    ]);
  });

  it('splitst op nieuwe regels', () => {
    expect(parseSpraakTekst('taak een\ntaak twee')).toEqual(['taak een', 'taak twee']);
  });

  it('splitst op het losse woord "en"', () => {
    expect(parseSpraakTekst('was doen en ramen zemen')).toEqual(['was doen', 'ramen zemen']);
  });

  it('filtert lege regels eruit', () => {
    expect(parseSpraakTekst('taak een,, taak twee')).toEqual(['taak een', 'taak twee']);
  });

  it('geeft een lege lijst voor lege input', () => {
    expect(parseSpraakTekst('')).toEqual([]);
    expect(parseSpraakTekst(null)).toEqual([]);
  });
});
