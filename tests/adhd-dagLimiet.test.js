import { describe, it, expect } from 'vitest';
import { dagLimiet, minutenTotStopmoment, middagAdvies } from '../src/lib/adhd/dagLimiet.js';

describe('dagLimiet', () => {
  it('geeft minder taken, een korter focusblok en minder uren bij lage energie', () => {
    expect(dagLimiet('laag', 8)).toEqual({ taken: 3, blok: 25, uren: 4 });
  });

  it('geeft meer taken, een langer focusblok en de volle daglimiet bij hoge energie', () => {
    expect(dagLimiet('hoog', 8)).toEqual({ taken: 7, blok: 90, uren: 8 });
  });

  it('schaalt de urenlimiet mee met de ingestelde werkuren per dag', () => {
    expect(dagLimiet('midden', 4)).toEqual({ taken: 5, blok: 45, uren: 3 });
  });

  it('valt terug op midden zonder bekend energieniveau, met 8 uur als standaard werkdag', () => {
    expect(dagLimiet(undefined)).toEqual({ taken: 5, blok: 45, uren: 6 });
    expect(dagLimiet('onbekend')).toEqual({ taken: 5, blok: 45, uren: 6 });
  });
});

describe('minutenTotStopmoment', () => {
  it('geeft positieve minuten als het stopmoment nog moet komen', () => {
    const nu = new Date(2026, 0, 1, 16, 45);
    expect(minutenTotStopmoment('17:00', nu)).toBe(15);
  });

  it('geeft negatieve minuten als het stopmoment al voorbij is', () => {
    const nu = new Date(2026, 0, 1, 17, 30);
    expect(minutenTotStopmoment('17:00', nu)).toBe(-30);
  });
});

describe('middagAdvies', () => {
  it('geeft voor elk geldig niveau een tekst', () => {
    expect(middagAdvies('laag')).toBeTruthy();
    expect(middagAdvies('zelfde')).toBeTruthy();
    expect(middagAdvies('hoog')).toBeTruthy();
  });

  it('geeft null voor een onbekend niveau', () => {
    expect(middagAdvies('onbekend')).toBeNull();
  });
});
