import { describe, it, expect } from 'vitest';
import { isGeldigeTraining } from '../src/hooks/useActieveTraining.js';

describe('isGeldigeTraining', () => {
  it('is geldig als er geen actieve training is', () => {
    expect(isGeldigeTraining({ letter: null })).toBe(true);
    expect(isGeldigeTraining(null)).toBe(true);
  });

  it('is geldig voor het huidige, volledige oefening-formaat', () => {
    const training = {
      letter: 'A',
      oefeningen: [{ id: 'squat', werk: [false, false], setGew: [45, 45], setReps: [5, 5] }],
      extras: [{ id: 'row', werk: [false], setGew: [10], setReps: [10] }],
    };
    expect(isGeldigeTraining(training)).toBe(true);
  });

  it('is ongeldig voor het oude formaat (afgevinkt i.p.v. werk/setGew/setReps)', () => {
    const training = {
      letter: 'A',
      oefeningen: [{ id: 'squat', afgevinkt: [false, false, false, false, false] }],
    };
    expect(isGeldigeTraining(training)).toBe(false);
  });

  it('is ongeldig als oefeningen geen array is', () => {
    expect(isGeldigeTraining({ letter: 'A', oefeningen: null })).toBe(false);
  });

  it('is ongeldig als extras het oude formaat hebben', () => {
    const training = {
      letter: 'A',
      oefeningen: [{ id: 'squat', werk: [false], setGew: [45], setReps: [5] }],
      extras: [{ id: 'row', afgevinkt: [false] }],
    };
    expect(isGeldigeTraining(training)).toBe(false);
  });
});
