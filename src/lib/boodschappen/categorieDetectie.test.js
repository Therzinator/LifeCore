import { describe, it, expect } from 'vitest';
import { bepaalCategorie, groepeerOpAfdeling } from './categorieDetectie.js';

describe('bepaalCategorie', () => {
  it('herkent groente en fruit', () => {
    expect(bepaalCategorie('appel')).toBe('Groente & Fruit');
    expect(bepaalCategorie('Rode paprika')).toBe('Groente & Fruit');
  });

  it('herkent zuivel los van kaas', () => {
    expect(bepaalCategorie('melk')).toBe('Zuivel & Eieren');
    expect(bepaalCategorie('belegen kaas')).toBe('Kaas & Vleeswaren');
  });

  it('is niet hoofdlettergevoelig en negeert omringende spaties', () => {
    expect(bepaalCategorie('  MELK  ')).toBe('Zuivel & Eieren');
  });

  it('kiest de langere, specifiekere match i.p.v. een kort woord uit een andere afdeling', () => {
    expect(bepaalCategorie('shampoo')).toBe('Huishouden & Verzorging');
    expect(bepaalCategorie('suiker')).toBe('Voorraadkast');
  });

  it('valt terug op Overig voor een onbekend item', () => {
    expect(bepaalCategorie('een heel vreemd verzonnen ding')).toBe('Overig');
  });
});

describe('groepeerOpAfdeling', () => {
  it('groepeert items per afdeling in de vaste looproute en slaat lege afdelingen over', () => {
    const items = [
      { id: '1', tekst: 'melk' },
      { id: '2', tekst: 'appel' },
      { id: '3', tekst: 'yoghurt' },
    ];
    const groepen = groepeerOpAfdeling(items);
    expect(groepen.map((g) => g.afdeling)).toEqual(['Groente & Fruit', 'Zuivel & Eieren']);
    expect(groepen[0].items.map((i) => i.id)).toEqual(['2']);
    expect(groepen[1].items.map((i) => i.id)).toEqual(['1', '3']);
  });

  it('geeft een lege lijst terug zonder crash bij geen items', () => {
    expect(groepeerOpAfdeling([])).toEqual([]);
  });
});
