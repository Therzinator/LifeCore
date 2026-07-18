import { describe, it, expect } from 'vitest';
import { volgendeGewicht, isNieuwePR } from '../src/lib/training/progressie.js';

describe('volgendeGewicht', () => {
  it('valt terug op 2.5kg zonder opgegeven increment', () => {
    expect(volgendeGewicht(60)).toBe(62.5);
    expect(volgendeGewicht(40)).toBe(42.5);
  });

  it('gebruikt het per-oefening increment (bijv. 5kg voor deadlift)', () => {
    expect(volgendeGewicht(80, 5)).toBe(85);
    expect(volgendeGewicht(20, 1.25)).toBe(21.25);
  });
});

describe('isNieuwePR', () => {
  it('is altijd een PR als er nog geen geschiedenis is', () => {
    expect(isNieuwePR('squat', 20, [])).toBe(true);
  });

  it('is een PR als het gewicht hoger is dan het historische maximum', () => {
    const sessies = [
      { oefeningen: [{ id: 'squat', gewicht: 50 }] },
      { oefeningen: [{ id: 'squat', gewicht: 55 }] },
    ];
    expect(isNieuwePR('squat', 60, sessies)).toBe(true);
  });

  it('is geen PR als het gewicht niet hoger is dan het historische maximum', () => {
    const sessies = [{ oefeningen: [{ id: 'squat', gewicht: 60 }] }];
    expect(isNieuwePR('squat', 60, sessies)).toBe(false);
    expect(isNieuwePR('squat', 55, sessies)).toBe(false);
  });

  it('kijkt alleen naar de opgegeven oefening', () => {
    const sessies = [{ oefeningen: [{ id: 'bench', gewicht: 100 }] }];
    expect(isNieuwePR('squat', 20, sessies)).toBe(true);
  });
});
