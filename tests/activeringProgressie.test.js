import { describe, it, expect } from 'vitest';
import {
  volgendPlankDoel, volgendPushDoel, PLANK_STAP_SECONDEN, PUSH_STAP_REPS, PLANK_MINIMUM_SECONDEN,
} from '../src/lib/training/activeringProgressie.js';

const VANDAAG = '2026-07-22';

function sessie(datum, overrides = {}) {
  return { datum, plankSeconden: 30, plankGedaan: true, pushReps: 10, pushGedaan: true, ...overrides };
}

describe('volgendPlankDoel', () => {
  it('houdt het doel gelijk zonder geschiedenis', () => {
    expect(volgendPlankDoel([], 30, VANDAAG)).toBe(30);
  });

  it('houdt het doel gelijk met minder dan 3 geslaagde dagen deze week', () => {
    const sessies = [sessie('2026-07-20'), sessie('2026-07-21')];
    expect(volgendPlankDoel(sessies, 30, VANDAAG)).toBe(30);
  });

  it('verhoogt het doel met 1 stap na 3+ geslaagde dagen in de afgelopen week', () => {
    const sessies = [sessie('2026-07-18'), sessie('2026-07-19'), sessie('2026-07-20'), sessie('2026-07-21')];
    expect(volgendPlankDoel(sessies, 30, VANDAAG)).toBe(30 + PLANK_STAP_SECONDEN);
  });

  it('telt een dag niet mee als de timer niet gehaald is', () => {
    const sessies = [
      sessie('2026-07-19', { plankSeconden: 20 }),
      sessie('2026-07-20', { plankSeconden: 20 }),
      sessie('2026-07-21', { plankSeconden: 20 }),
    ];
    expect(volgendPlankDoel(sessies, 30, VANDAAG)).toBe(30);
  });

  it('telt een dag niet mee als plankGedaan false is', () => {
    const sessies = [
      sessie('2026-07-19', { plankGedaan: false }),
      sessie('2026-07-20'),
      sessie('2026-07-21'),
    ];
    expect(volgendPlankDoel(sessies, 30, VANDAAG)).toBe(30);
  });

  it('bouwt af (deload) na meer dan 10 dagen zonder sessie', () => {
    const sessies = [sessie('2026-07-01', { plankSeconden: 60 })];
    expect(volgendPlankDoel(sessies, 60, VANDAAG)).toBe(40);
  });

  it('bodemt de deload nooit onder het minimum', () => {
    const sessies = [sessie('2026-07-01', { plankSeconden: 15 })];
    expect(volgendPlankDoel(sessies, 15, VANDAAG)).toBe(PLANK_MINIMUM_SECONDEN);
  });
});

describe('volgendPushDoel', () => {
  it('verhoogt met 1 rep na 3+ geslaagde dagen', () => {
    const sessies = [sessie('2026-07-18'), sessie('2026-07-19'), sessie('2026-07-20'), sessie('2026-07-21')];
    expect(volgendPushDoel(sessies, 10, VANDAAG)).toBe(10 + PUSH_STAP_REPS);
  });

  it('houdt gelijk zonder recente geslaagde dagen', () => {
    const sessies = [sessie('2026-07-01')];
    // > 10 dagen geleden -> deload i.p.v. gelijk blijven
    expect(volgendPushDoel(sessies, 10, VANDAAG)).toBeLessThan(10);
  });
});
