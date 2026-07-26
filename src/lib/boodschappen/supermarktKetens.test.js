import { describe, it, expect } from 'vitest';
import { ketenNaarSlug, slugNaarNaam } from './supermarktKetens.js';

describe('ketenNaarSlug', () => {
  it('herkent de standaardnamen ongeacht hoofdletters/spaties', () => {
    expect(ketenNaarSlug('Albert Heijn')).toBe('albert_heijn');
    expect(ketenNaarSlug('lidl')).toBe('lidl');
    expect(ketenNaarSlug('  Dirk ')).toBe('dirk');
  });

  it('herkent bekende aliassen', () => {
    expect(ketenNaarSlug('AH')).toBe('albert_heijn');
    expect(ketenNaarSlug('Deka Markt')).toBe('dekamarkt');
  });

  it('geeft null voor een onbekende keten i.p.v. te crashen', () => {
    expect(ketenNaarSlug('Coop')).toBeNull();
  });
});

describe('slugNaarNaam', () => {
  it('geeft de leesbare naam voor een bekende slug', () => {
    expect(slugNaarNaam('albert_heijn')).toBe('Albert Heijn');
    expect(slugNaarNaam('dekamarkt')).toBe('DekaMarkt');
  });

  it('valt terug op de slug zelf voor een onbekende slug', () => {
    expect(slugNaarNaam('onbekend')).toBe('onbekend');
  });
});
