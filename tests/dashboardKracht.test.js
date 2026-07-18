import { describe, it, expect } from 'vitest';
import { krachtPerWeek, krachtPerMaand } from '../src/lib/training/dashboardKracht.js';

describe('krachtPerWeek', () => {
  it('combineert meerdere oefeningen tot één totaal per week', () => {
    const sessies = [
      { datum: '2026-01-05', oefeningen: [{ id: 'squat', gewicht: 60, reps: 5 }, { id: 'bench', gewicht: 40, reps: 5 }] },
      { datum: '2026-01-06', oefeningen: [{ id: 'row', gewicht: 30, reps: 5 }] },
    ];
    const { labels, totalen } = krachtPerWeek(sessies);
    expect(labels).toEqual(['2026-01-05']);
    expect(totalen[0]).toBeGreaterThan(0);
  });

  it('neemt het hoogste 1RM per oefening binnen een week, niet de som van sets', () => {
    const sessies = [
      { datum: '2026-01-05', oefeningen: [{ id: 'squat', gewicht: 60, reps: 5 }] },
      { datum: '2026-01-06', oefeningen: [{ id: 'squat', gewicht: 62.5, reps: 5 }] },
    ];
    const { totalen } = krachtPerWeek(sessies);
    expect(totalen).toHaveLength(1);
  });

  it('geeft lege lijsten zonder sessies', () => {
    expect(krachtPerWeek([])).toEqual({ labels: [], totalen: [] });
  });
});

describe('krachtPerMaand', () => {
  it('groepeert per kalendermaand i.p.v. per week', () => {
    const sessies = [
      { datum: '2026-01-05', oefeningen: [{ id: 'squat', gewicht: 60, reps: 5 }] },
      { datum: '2026-01-26', oefeningen: [{ id: 'squat', gewicht: 65, reps: 5 }] },
    ];
    const { labels } = krachtPerMaand(sessies);
    expect(labels).toEqual(['2026-01']);
  });
});
