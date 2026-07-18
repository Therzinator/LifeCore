import { describe, it, expect } from 'vitest';
import { tempoNaarSec, tempoLabel } from '../src/lib/cardio/tempo.js';

describe('tempoNaarSec', () => {
  it('zet min:sec om naar seconden', () => {
    expect(tempoNaarSec('5:30')).toBe(330);
    expect(tempoNaarSec('4:00')).toBe(240);
  });

  it('geeft 0 voor lege of ontbrekende invoer', () => {
    expect(tempoNaarSec('')).toBe(0);
    expect(tempoNaarSec(undefined)).toBe(0);
  });
});

describe('tempoLabel', () => {
  it('formatteert seconden naar min:sec', () => {
    expect(tempoLabel(330)).toBe('5:30');
    expect(tempoLabel(65)).toBe('1:05');
  });

  it('geeft een streepje voor 0 of ontbrekend', () => {
    expect(tempoLabel(0)).toBe('—');
    expect(tempoLabel(undefined)).toBe('—');
  });
});
