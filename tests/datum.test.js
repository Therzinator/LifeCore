import { describe, it, expect } from 'vitest';
import { datumKey, maandagVan, dagIndexVan } from '../src/utils/datum.js';

// Regressietest voor een echte productiebug: toISOString().slice(0,10) geeft
// de UTC-datum, die in een tijdzone ten oosten van UTC (bv. Nederland,
// GMT+1/+2) een dag terugspringt zodra de lokale tijd rond middernacht ligt.
// maandagVan() gaf daardoor soms de verkeerde maandag terug wanneer 'm
// gevoed werd met een lokaal-om-middernacht-geconstrueerde Date (bv. via
// new Date(jaar, maand, dag).toISOString()) — precies wat de Agenda-
// maandkalender deed, met een verkeerde weekdag-kolom als zichtbaar gevolg.
describe('datumKey', () => {
  it('formatteert de lokale kalenderdag, niet de UTC-dag', () => {
    // Lokaal-om-middernacht-geconstrueerde datum: new Date(jaar, maand-1, dag)
    // is precies het scenario dat toISOString().slice(0,10) fout liet gaan.
    const lokaleMiddernacht = new Date(2026, 6, 1); // 1 juli 2026, lokaal 00:00
    expect(datumKey(lokaleMiddernacht)).toBe('2026-07-01');
  });
});

describe('maandagVan', () => {
  it('geeft de correcte maandag terug voor een datum midden in de week', () => {
    expect(maandagVan('2026-07-16')).toBe('2026-07-13'); // donderdag -> maandag van die week
  });

  it('geeft de correcte maandag terug wanneer gevoed met een lokaal-om-middernacht-datum (regressie)', () => {
    // 1 juli 2026 is een woensdag — de maandag van die week is 29 juni.
    const eersteDagVanMaand = new Date(2026, 6, 1);
    expect(maandagVan(eersteDagVanMaand.toISOString())).toBe('2026-06-29');
  });

  it('blijft op dezelfde dag staan als die zelf al een maandag is', () => {
    expect(maandagVan('2026-07-13')).toBe('2026-07-13');
  });
});

describe('dagIndexVan', () => {
  it('geeft de juiste index voor een bekende datum (18 juli 2026 is een zaterdag)', () => {
    expect(dagIndexVan('2026-07-18')).toBe(5); // ma=0 .. zo=6, zaterdag=5
  });

  it('geeft 6 voor zondag', () => {
    expect(dagIndexVan('2026-07-19')).toBe(6);
  });

  it('geeft 0 voor maandag', () => {
    expect(dagIndexVan('2026-07-13')).toBe(0);
  });
});
