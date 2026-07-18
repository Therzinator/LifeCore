import { describe, it, expect } from 'vitest';
import { bepaalSignalen } from '../src/lib/welzijn/signalering.js';

function afname(datum, scores) {
  return { datum, scores };
}

describe('bepaalSignalen — signaal A (aanhoudend hoge uitputting)', () => {
  it('signaleert wanneer een uitputtingsschaal 2 keer op rij >= 2.0 scoort', () => {
    const afnames = [
      afname('2026-01-01', { persoonlijk: 2.2, werk: 1.0, herstel: 2 }),
      afname('2026-01-15', { persoonlijk: 2.4, werk: 1.0, herstel: 2 }),
    ];
    const signalen = bepaalSignalen(afnames);
    expect(signalen.some((s) => s.id === 'uitputting_persoonlijk')).toBe(true);
    expect(signalen.some((s) => s.id === 'uitputting_werk')).toBe(false);
  });

  it('signaleert niet bij één hoge meting (geen aanhoudendheid)', () => {
    const afnames = [
      afname('2026-01-01', { persoonlijk: 1.0, werk: 1.0, herstel: 2 }),
      afname('2026-01-15', { persoonlijk: 2.5, werk: 1.0, herstel: 2 }),
    ];
    expect(bepaalSignalen(afnames).some((s) => s.type === 'uitputting')).toBe(false);
  });

  it('signaleert niet onder de drempel van 2.0', () => {
    const afnames = [
      afname('2026-01-01', { persoonlijk: 1.9, werk: 1.0, herstel: 2 }),
      afname('2026-01-15', { persoonlijk: 1.9, werk: 1.0, herstel: 2 }),
    ];
    expect(bepaalSignalen(afnames).some((s) => s.type === 'uitputting')).toBe(false);
  });

  it('heeft geen enkel signaal nodig bij minder dan 2 afnames', () => {
    expect(bepaalSignalen([afname('2026-01-01', { persoonlijk: 3, werk: 3, herstel: 0 })])).toEqual([]);
    expect(bepaalSignalen([])).toEqual([]);
  });
});

describe('bepaalSignalen — signaal B (dalende hersteltrend)', () => {
  it('signaleert bij 3 opeenvolgende dalingen met totaal >= 0.4', () => {
    const afnames = [
      afname('2026-01-01', { persoonlijk: 0, werk: 0, herstel: 2.0 }),
      afname('2026-01-15', { persoonlijk: 0, werk: 0, herstel: 1.6 }),
      afname('2026-01-29', { persoonlijk: 0, werk: 0, herstel: 1.2 }),
    ];
    expect(bepaalSignalen(afnames).some((s) => s.id === 'herstel_dalend')).toBe(true);
  });

  it('signaleert niet als de daling niet monotoon is', () => {
    const afnames = [
      afname('2026-01-01', { persoonlijk: 0, werk: 0, herstel: 2.0 }),
      afname('2026-01-15', { persoonlijk: 0, werk: 0, herstel: 2.3 }),
      afname('2026-01-29', { persoonlijk: 0, werk: 0, herstel: 1.2 }),
    ];
    expect(bepaalSignalen(afnames).some((s) => s.id === 'herstel_dalend')).toBe(false);
  });

  it('signaleert niet als de totale daling kleiner is dan 0.4', () => {
    const afnames = [
      afname('2026-01-01', { persoonlijk: 0, werk: 0, herstel: 2.0 }),
      afname('2026-01-15', { persoonlijk: 0, werk: 0, herstel: 1.9 }),
      afname('2026-01-29', { persoonlijk: 0, werk: 0, herstel: 1.8 }),
    ];
    expect(bepaalSignalen(afnames).some((s) => s.id === 'herstel_dalend')).toBe(false);
  });

  it('heeft minstens 3 afnames nodig', () => {
    const afnames = [
      afname('2026-01-01', { persoonlijk: 0, werk: 0, herstel: 2.0 }),
      afname('2026-01-15', { persoonlijk: 0, werk: 0, herstel: 1.0 }),
    ];
    expect(bepaalSignalen(afnames).some((s) => s.id === 'herstel_dalend')).toBe(false);
  });
});
