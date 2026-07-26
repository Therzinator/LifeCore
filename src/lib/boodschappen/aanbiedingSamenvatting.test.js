import { describe, it, expect } from 'vitest';
import { groepeerPerSupermarkt } from './aanbiedingSamenvatting.js';

describe('groepeerPerSupermarkt', () => {
  it('groepeert items per retailer op basis van de beste (eerste) kandidaat', () => {
    const items = [{ id: '1', tekst: 'melk' }, { id: '2', tekst: 'brood' }, { id: '3', tekst: 'kaas' }];
    const aanbiedingen = {
      1: [{ naam: 'Campina melk', retailer: 'lidl', prijs: 1.99, voordeel: 0.7 }],
      2: [{ naam: 'Volkoren brood', retailer: 'albert_heijn', prijs: 1.5, voordeel: 0.5 }],
      3: [{ naam: 'Goudse kaas', retailer: 'lidl', prijs: 3.0, voordeel: 1.0 }],
    };
    const groepen = groepeerPerSupermarkt(items, aanbiedingen);
    expect(groepen.map((g) => g.retailerNaam)).toEqual(['Lidl', 'Albert Heijn']);
    expect(groepen[0].items).toHaveLength(2);
    expect(groepen[0].totaalVoordeel).toBeCloseTo(1.7);
    expect(groepen[1].totaalVoordeel).toBeCloseTo(0.5);
  });

  it('slaat items zonder gevonden aanbieding over', () => {
    const items = [{ id: '1', tekst: 'melk' }];
    expect(groepeerPerSupermarkt(items, {})).toEqual([]);
    expect(groepeerPerSupermarkt(items, { 1: [] })).toEqual([]);
  });

  it('sorteert de supermarkten op hoogste totale voordeel eerst', () => {
    const items = [{ id: '1', tekst: 'a' }, { id: '2', tekst: 'b' }];
    const aanbiedingen = {
      1: [{ naam: 'A', retailer: 'lidl', prijs: 1, voordeel: 0.2 }],
      2: [{ naam: 'B', retailer: 'jumbo', prijs: 1, voordeel: 5 }],
    };
    const groepen = groepeerPerSupermarkt(items, aanbiedingen);
    expect(groepen.map((g) => g.retailerSlug)).toEqual(['jumbo', 'lidl']);
  });
});
