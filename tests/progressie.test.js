import { describe, it, expect } from 'vitest';
import { volgendeGewicht, isNieuwePR } from '../src/lib/training/progressie.js';

describe('volgendeGewicht', () => {
  it('verhoogt de meeste oefeningen met 2.5kg', () => {
    expect(volgendeGewicht(60, 'squat')).toBe(62.5);
    expect(volgendeGewicht(40, 'bench')).toBe(42.5);
  });

  it('verhoogt deadlift met 5kg', () => {
    expect(volgendeGewicht(80, 'deadlift')).toBe(85);
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
