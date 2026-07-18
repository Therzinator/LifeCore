import { describe, it, expect } from 'vitest';
import { lengteCategorie, filterSessies, voortgangsStats } from '../src/lib/mindfulness/sessies.js';

describe('lengteCategorie', () => {
  it('is kort tot en met 5 minuten', () => {
    expect(lengteCategorie(120)).toBe('kort');
    expect(lengteCategorie(300)).toBe('kort');
  });

  it('is gemiddeld boven 5 minuten', () => {
    expect(lengteCategorie(301)).toBe('gemiddeld');
    expect(lengteCategorie(900)).toBe('gemiddeld');
  });
});

describe('filterSessies', () => {
  const sessies = [
    { id: '1', thema_id: 'stress', duur_seconden: 180 },
    { id: '2', thema_id: 'stress', duur_seconden: 900 },
    { id: '3', thema_id: 'slaap', duur_seconden: 180 },
  ];

  it('filtert op thema', () => {
    expect(filterSessies(sessies, { themaId: 'slaap' }).map((s) => s.id)).toEqual(['3']);
  });

  it('filtert op lengte', () => {
    expect(filterSessies(sessies, { lengte: 'gemiddeld' }).map((s) => s.id)).toEqual(['2']);
  });

  it('combineert beide filters', () => {
    expect(filterSessies(sessies, { themaId: 'stress', lengte: 'kort' }).map((s) => s.id)).toEqual(['1']);
  });

  it('geeft alles terug zonder filters', () => {
    expect(filterSessies(sessies)).toHaveLength(3);
  });
});

describe('voortgangsStats', () => {
  it('telt sessies en minuten op, ook bij gedeeltelijk beluisterde sessies', () => {
    const records = [
      { gestart_op: '2026-01-05T08:00:00Z', geluisterd_seconden: 300, voltooid: true },
      { gestart_op: '2026-01-06T08:00:00Z', geluisterd_seconden: 120, voltooid: false },
    ];
    const stats = voortgangsStats(records);
    expect(stats.totaalSessies).toBe(2);
    expect(stats.totaalMinuten).toBe(7);
    expect(stats.labels).toEqual(['2026-01-05']);
    expect(stats.sessiesPerWeek).toEqual([2]);
    expect(stats.minutenPerWeek).toEqual([7]);
  });

  it('geeft lege stats zonder records', () => {
    const stats = voortgangsStats([]);
    expect(stats.totaalSessies).toBe(0);
    expect(stats.totaalMinuten).toBe(0);
    expect(stats.labels).toEqual([]);
  });
});
