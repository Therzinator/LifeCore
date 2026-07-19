import { describe, it, expect } from 'vitest';
import { huidigePeriodeKey, percentageAfgerond, percentagePerWeek } from '../src/lib/werk/huishoudPeriode.js';

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
