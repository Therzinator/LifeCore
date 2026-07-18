import { describe, it, expect } from 'vitest';
import { werkTakenPerWeek } from '../src/lib/werk/dashboardWerk.js';

describe('werkTakenPerWeek', () => {
  it('telt alleen taken die daadwerkelijk afgerond zijn', () => {
    const taken = [
      { klaar: true, afgerondOp: '2026-01-05' },
      { klaar: true, afgerondOp: '2026-01-06' },
      { klaar: false, afgerondOp: null },
    ];
    const { labels, aantalPerWeek } = werkTakenPerWeek(taken);
    expect(labels).toEqual(['2026-01-05']);
    expect(aantalPerWeek).toEqual([2]);
  });

  it('gebruikt de voltooiingsdatum, niet de aanmaakdatum', () => {
    const taken = [{ klaar: true, aangemaaktOp: '2025-12-01', afgerondOp: '2026-01-05' }];
    const { labels } = werkTakenPerWeek(taken);
    expect(labels).toEqual(['2026-01-05']);
  });

  it('geeft lege lijsten zonder afgeronde taken', () => {
    expect(werkTakenPerWeek([])).toEqual({ labels: [], aantalPerWeek: [] });
  });
});
