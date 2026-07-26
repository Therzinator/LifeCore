import { describe, it, expect } from 'vitest';
import { berekenOpbouwsets } from '../src/lib/training/opbouw.js';

describe('berekenOpbouwsets', () => {
  it('berekent 4 opbouwsets voor een normaal werkgewicht', () => {
    const sets = berekenOpbouwsets(100, 'recht', 2.5);
    expect(sets.map((s) => s.gewicht)).toEqual([20, 40, 60, 80]);
    expect(sets.map((s) => s.reps)).toEqual([5, 5, 3, 2]);
    expect(sets.map((s) => s.label)).toEqual(['Lege stang', '40%', '60%', '80%']);
  });

  it('dedupliceert sets met hetzelfde gewicht', () => {
    const sets = berekenOpbouwsets(50, 'recht', 2.5);
    expect(sets.map((s) => s.gewicht)).toEqual([20, 30, 40]);
  });

  it('gebruikt de curl-stang bij stangType curl', () => {
    const sets = berekenOpbouwsets(50, 'curl', 2.5);
    expect(sets.map((s) => s.gewicht)).toEqual([10, 20, 30, 40]);
  });

  it('filtert sets die zwaarder zijn dan of gelijk aan het werkgewicht', () => {
    const sets = berekenOpbouwsets(20, 'recht', 2.5);
    expect(sets.some((s) => s.gewicht >= 20)).toBe(false);
    expect(sets.map((s) => s.gewicht)).toEqual([7.5, 12.5, 15]);
  });

  it('gebruikt minder, grotere opbouwsets zonder lege stang voor deadlift', () => {
    const sets = berekenOpbouwsets(100, 'recht', 2.5, {}, undefined, 'deadlift');
    expect(sets.map((s) => s.label)).toEqual(['50%', '70%', '85%']);
    expect(sets.map((s) => s.gewicht)).toEqual([50, 70, 85]);
    expect(sets.map((s) => s.reps)).toEqual([5, 3, 1]);
  });

  it('past dezelfde deadlift-opbouw toe op sumo-deadlift', () => {
    const sets = berekenOpbouwsets(100, 'recht', 2.5, {}, undefined, 'sumo-deadlift');
    expect(sets.map((s) => s.label)).toEqual(['50%', '70%', '85%']);
  });

  it('blijft de standaardopbouw gebruiken voor andere oefeningen', () => {
    const sets = berekenOpbouwsets(100, 'recht', 2.5, {}, undefined, 'squat');
    expect(sets.map((s) => s.label)).toEqual(['Lege stang', '40%', '60%', '80%']);
  });

  it('gebruikt een eigen startgewicht i.p.v. de lege stang als dat is ingesteld', () => {
    const sets = berekenOpbouwsets(100, 'recht', 2.5, {}, undefined, 'squat', 30);
    expect(sets.map((s) => s.label)).toEqual(['Startgewicht', '40%', '60%', '80%']);
    expect(sets[0].gewicht).toBe(30);
  });

  it('negeert het eigen startgewicht voor deadlift-achtige oefeningen', () => {
    const sets = berekenOpbouwsets(100, 'recht', 2.5, {}, undefined, 'deadlift', 30);
    expect(sets.map((s) => s.label)).toEqual(['50%', '70%', '85%']);
  });
});
