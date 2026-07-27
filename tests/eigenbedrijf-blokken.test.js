import { describe, it, expect } from 'vitest';
import { duurMinuten, blokkenVoorDagIndex, geplandeMinuten } from '../src/lib/eigenbedrijf/blokken.js';

const STANDAARD_BLOKKEN = [
  { id: 'eb_di', dagNr: 2, start: '19:30', eind: '21:30', soort: 'facturabel' },
  { id: 'eb_do', dagNr: 4, start: '19:30', eind: '21:30', soort: 'platform' },
  { id: 'eb_za', dagNr: 6, start: '09:00', eind: '12:00', soort: 'flexibel' },
  { id: 'eb_zo', dagNr: 7, start: '20:00', eind: '20:30', soort: 'toets' },
];

describe('duurMinuten', () => {
  it('berekent het verschil in minuten', () => {
    expect(duurMinuten('19:30', '21:30')).toBe(120);
    expect(duurMinuten('09:00', '12:00')).toBe(180);
    expect(duurMinuten('20:00', '20:30')).toBe(30);
  });

  it('geeft 0 bij een eindtijd vóór de starttijd i.p.v. negatief', () => {
    expect(duurMinuten('21:00', '19:00')).toBe(0);
  });
});

describe('blokkenVoorDagIndex', () => {
  it('vindt het blok op dinsdag (dagIndex 1, dagNr 2)', () => {
    const gevonden = blokkenVoorDagIndex(STANDAARD_BLOKKEN, 1);
    expect(gevonden).toHaveLength(1);
    expect(gevonden[0].id).toBe('eb_di');
  });

  it('geeft leeg voor een dag zonder blok (maandag)', () => {
    expect(blokkenVoorDagIndex(STANDAARD_BLOKKEN, 0)).toEqual([]);
  });

  it('geeft leeg zonder blokken', () => {
    expect(blokkenVoorDagIndex(null, 1)).toEqual([]);
  });
});

describe('geplandeMinuten', () => {
  it('telt facturabel, platform en flexibel apart en telt toets niet mee', () => {
    const totalen = geplandeMinuten(STANDAARD_BLOKKEN);
    expect(totalen.facturabel).toBe(120);
    expect(totalen.platform).toBe(120);
    expect(totalen.flexibel).toBe(180);
    expect(totalen.werkTotaal).toBe(420);
  });

  it('geeft nul-totalen zonder blokken', () => {
    expect(geplandeMinuten([])).toEqual({ facturabel: 0, platform: 0, flexibel: 0, werkTotaal: 0 });
  });
});
