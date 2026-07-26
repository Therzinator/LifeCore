import { describe, it, expect } from 'vitest';
import {
  huidigePeriodeKey, percentageAfgerond, percentagePerWeek, laatstAfgerondOp, isVerschuldigd,
} from '../src/lib/werk/huishoudPeriode.js';

// Let op: test-tijdstippen gebruiken bewust 12:00 lokale tijd, niet middernacht
// — een Date op exact lokale middernacht kan bij toISOString() een dag
// terugschuiven afhankelijk van de tijdzone-offset. Een echte aanroep met
// `new Date()` heeft altijd een reëel tijdstip en loopt hier nooit tegenaan.

describe('huidigePeriodeKey', () => {
  it('geeft de maandag van de week voor frequentie "week"', () => {
    // 2026-01-07 is een woensdag
    expect(huidigePeriodeKey('week', new Date(2026, 0, 7, 12))).toBe('2026-01-05');
  });

  it('geeft de kalendermaand voor frequentie "maand"', () => {
    expect(huidigePeriodeKey('maand', new Date(2026, 0, 20, 12))).toBe('2026-01');
  });

  it('geeft dezelfde cyclus-key voor "aangepast" binnen hetzelfde interval', () => {
    const a = huidigePeriodeKey('aangepast', new Date(2026, 0, 7, 12), 10);
    const b = huidigePeriodeKey('aangepast', new Date(2026, 0, 10, 12), 10);
    expect(a).toBe(b);
  });

  it('geeft een andere cyclus-key voor "aangepast" na het verstrijken van het interval', () => {
    const a = huidigePeriodeKey('aangepast', new Date(2026, 0, 7, 12), 10);
    const b = huidigePeriodeKey('aangepast', new Date(2026, 0, 20, 12), 10);
    expect(a).not.toBe(b);
  });

  it('valt terug op het week-patroon voor "aangepast" zonder intervalDagen', () => {
    expect(huidigePeriodeKey('aangepast', new Date(2026, 0, 7, 12))).toBe('2026-01-05');
  });
});

describe('percentageAfgerond', () => {
  const taken = [
    { id: 'a', frequentie: 'week' },
    { id: 'b', frequentie: 'week' },
    { id: 'c', frequentie: 'maand' },
  ];

  it('berekent het percentage voor de huidige week', () => {
    const nu = new Date(2026, 0, 7, 12);
    const log = { a: { '2026-01-05': true } };
    expect(percentageAfgerond(taken, log, 'week', nu)).toEqual({ afgerond: 1, totaal: 2, percentage: 50 });
  });

  it('geeft null zonder taken van die frequentie', () => {
    expect(percentageAfgerond([], {}, 'week')).toBeNull();
  });
});

describe('percentagePerWeek', () => {
  it('geeft 0% voor gemiste weken i.p.v. ze weg te laten', () => {
    const taken = [{ id: 'a', frequentie: 'week' }];
    const log = { a: { '2026-01-05': true } };
    const nu = new Date(2026, 0, 19, 12); // 2 weken later
    const { labels, percentages } = percentagePerWeek(taken, log, 3, nu);
    expect(labels).toEqual(['2026-01-05', '2026-01-12', '2026-01-19']);
    expect(percentages).toEqual([100, 0, 0]);
  });

  it('geeft lege lijsten zonder week-taken', () => {
    expect(percentagePerWeek([], {})).toEqual({ labels: [], percentages: [] });
  });
});

describe('laatstAfgerondOp', () => {
  it('geeft null als de taak nog nooit is afgerond', () => {
    const taak = { id: 'a', frequentie: 'week' };
    expect(laatstAfgerondOp(taak, {})).toBeNull();
    expect(laatstAfgerondOp(taak, { a: {} })).toBeNull();
  });

  it('geeft het meest recente afrondingstijdstip, ook als er meerdere gelogd staan', () => {
    const taak = { id: 'a', frequentie: 'week' };
    const log = {
      a: {
        '2026-01-05': '2026-01-08T10:00:00.000Z',
        '2026-01-19': '2026-01-21T14:30:00.000Z',
        '2026-01-12': null, // ongedaan gemaakte afvinking telt niet mee
      },
    };
    expect(laatstAfgerondOp(taak, log)).toEqual(new Date('2026-01-21T14:30:00.000Z'));
  });

  it('is precies op het echte afrondingstijdstip, ook als dat laat in de periode valt', () => {
    // Weektaak op zondag afgerond (6 dagen na de maandag-periodesleutel) —
    // laatstAfgerondOp moet die zondag geven, niet de maandag ervoor (dat
    // zou de taak tot 6 dagen te vroeg als verschuldigd tonen).
    const taak = { id: 'a', frequentie: 'week' };
    const zondag = '2026-01-11T18:00:00.000Z';
    const log = { a: { '2026-01-05': zondag } };
    expect(laatstAfgerondOp(taak, log)).toEqual(new Date(zondag));
  });
});

describe('isVerschuldigd', () => {
  it('is verschuldigd als de taak nog nooit is afgerond', () => {
    expect(isVerschuldigd({ id: 'a', frequentie: 'week' }, {})).toBe(true);
  });

  it('wordt pas verschuldigd zodra de frequentie in dagen verstreken is sinds de laatste afronding', () => {
    const taak = { id: 'a', frequentie: 'week' };
    const log = { a: { '2026-01-05': new Date(2026, 0, 5, 9).toISOString() } };
    expect(isVerschuldigd(taak, log, new Date(2026, 0, 11, 12))).toBe(false); // 6 dagen later
    expect(isVerschuldigd(taak, log, new Date(2026, 0, 12, 12))).toBe(true); // 7 dagen later

  });

  it('blijft niet-verschuldigd tot 7 dagen na een LATE afronding, niet na de kalenderweek', () => {
    // Weektaak afgerond op zondag i.p.v. maandag — de 7 dagen tellen vanaf
    // die zondag, dus de eerstvolgende maandag (1 dag later) is nog niet
    // verschuldigd, ook al is de kalenderweek dan alweer voorbij.
    const taak = { id: 'a', frequentie: 'week' };
    const zondag = new Date(2026, 0, 11, 18);
    const log = { a: { '2026-01-05': zondag.toISOString() } };
    expect(isVerschuldigd(taak, log, new Date(2026, 0, 12, 12))).toBe(false);
    expect(isVerschuldigd(taak, log, new Date(2026, 0, 18, 19))).toBe(true); // 7 dagen na zondag
  });

  it('gebruikt intervalDagen voor frequentie "aangepast"', () => {
    const taak = { id: 'd', frequentie: 'aangepast', intervalDagen: 3 };
    const afgerond = new Date(2026, 0, 5, 12).toISOString();
    const log = { d: { [huidigePeriodeKey('aangepast', new Date(2026, 0, 5, 12), 3)]: afgerond } };
    expect(isVerschuldigd(taak, log, new Date(2026, 0, 6, 12))).toBe(false);
    expect(isVerschuldigd(taak, log, new Date(2026, 0, 10, 12))).toBe(true);
  });
});
