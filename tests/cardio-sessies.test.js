import { describe, it, expect } from 'vitest';
import {
  isNieuweTempoPR,
  adviesConsistentie,
  groeiPerWeek,
  omgevingsVerdeling,
  trainingsAdviezen,
} from '../src/lib/cardio/sessies.js';

describe('isNieuweTempoPR', () => {
  it('is een PR als er nog geen eerdere sessies zijn', () => {
    expect(isNieuweTempoPR('hardlopen', 5, '5:00', [])).toBe(true);
  });

  it('is een PR als het tempo sneller is dan het beste eerdere tempo', () => {
    const sessies = [{ type: 'hardlopen', afstand: 5, tempo: '5:30' }];
    expect(isNieuweTempoPR('hardlopen', 5, '5:00', sessies)).toBe(true);
  });

  it('is geen PR als het tempo niet sneller is', () => {
    const sessies = [{ type: 'hardlopen', afstand: 5, tempo: '5:00' }];
    expect(isNieuweTempoPR('hardlopen', 5, '5:30', sessies)).toBe(false);
  });

  it('kijkt alleen naar sessies van hetzelfde type', () => {
    const sessies = [{ type: 'fietsen', afstand: 20, tempo: '2:00' }];
    expect(isNieuweTempoPR('hardlopen', 5, '5:30', sessies)).toBe(true);
  });

  it('is geen PR zonder afstand of tempo', () => {
    expect(isNieuweTempoPR('hardlopen', 0, '5:00', [])).toBe(false);
    expect(isNieuweTempoPR('hardlopen', 5, '', [])).toBe(false);
  });
});

describe('adviesConsistentie', () => {
  it('geeft null als er minder dan 3 relevante sessies zijn', () => {
    expect(adviesConsistentie([{ type: 'hardlopen', datum: '2026-01-01', rpe: 5 }])).toBeNull();
  });

  it('signaleert geen sessies deze week', () => {
    const vandaag = new Date('2026-02-01');
    const sessies = [
      { type: 'hardlopen', datum: '2026-01-01', rpe: 5 },
      { type: 'hardlopen', datum: '2026-01-02', rpe: 5 },
      { type: 'hardlopen', datum: '2026-01-03', rpe: 5 },
    ];
    const advies = adviesConsistentie(sessies, vandaag);
    expect(advies.some((p) => p.kop === 'Geen sessies deze week')).toBe(true);
  });

  it('valt terug op een neutrale, positieve boodschap zonder bijzonderheden', () => {
    const vandaag = new Date('2026-01-04');
    const sessies = [
      { type: 'hardlopen', datum: '2026-01-01', rpe: 5 },
      { type: 'hardlopen', datum: '2026-01-02', rpe: 5 },
      { type: 'hardlopen', datum: '2026-01-03', rpe: 5 },
    ];
    const advies = adviesConsistentie(sessies, vandaag);
    expect(advies).toEqual([{ kop: 'Goed bezig', tekst: expect.any(String) }]);
  });
});

describe('omgevingsVerdeling', () => {
  it('telt natuur- en stadsessies apart, alleen voor buiten-activiteiten', () => {
    const sessies = [
      { type: 'hardlopen', omgeving: 'natuur' },
      { type: 'wandelen', omgeving: 'stad' },
      { type: 'hardlopen', omgeving: 'natuur' },
      { type: 'fietsen', omgeving: 'natuur' },
    ];
    expect(omgevingsVerdeling(sessies)).toEqual({ natuur: 2, stad: 1, onbekend: 0, totaal: 3 });
  });
});

describe('trainingsAdviezen', () => {
  it('geeft een lege lijst met minder dan 5 hardloopsessies', () => {
    const sessies = [
      { type: 'hardlopen', afstand: 5 },
      { type: 'hardlopen', afstand: 5 },
    ];
    expect(trainingsAdviezen(sessies)).toEqual([]);
  });
});

describe('groeiPerWeek', () => {
  it('groepeert afstand per week en berekent totalen', () => {
    const sessies = [
      { datum: '2026-01-05', afstand: 5, tempo: '5:00' },
      { datum: '2026-01-06', afstand: 3, tempo: '5:30' },
    ];
    const groei = groeiPerWeek(sessies);
    expect(groei.totaalKm).toBe(8);
    expect(groei.totaalSessies).toBe(2);
    expect(groei.afstandPerWeek).toEqual([8]);
    expect(groei.besteTempoSec).toBe(300);
  });

  it('geeft lege structuur zonder sessies met afstand', () => {
    const groei = groeiPerWeek([]);
    expect(groei.labels).toEqual([]);
    expect(groei.totaalKm).toBe(0);
  });
});
