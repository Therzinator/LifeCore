import { describe, it, expect } from 'vitest';
import { SHUTDOWN_ITEMS, stemmingReactie } from '../src/lib/adhd/afsluiten.js';

describe('SHUTDOWN_ITEMS', () => {
  it('heeft precies 4 checklist-items', () => {
    expect(SHUTDOWN_ITEMS).toHaveLength(4);
    SHUTDOWN_ITEMS.forEach((item) => expect(item).toBeTruthy());
  });
});

describe('stemmingReactie', () => {
  it('geeft een guilt-free reactie voor een slechte dag', () => {
    expect(stemmingReactie('slecht')).toMatch(/mag/i);
  });

  it('geeft null voor een onbekend niveau', () => {
    expect(stemmingReactie('onbekend')).toBeNull();
  });
});
