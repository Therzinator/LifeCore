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
});
