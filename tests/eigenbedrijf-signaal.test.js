import { describe, it, expect } from 'vitest';
import { koppeling6_eigenBedrijfOverschrijding } from '../src/lib/signalen/kruisverbanden.js';
import { maandagVan } from '../src/utils/datum.js';

const BLOKKEN = [
  { id: 'eb_di', dagNr: 2, start: '19:30', eind: '21:30', soort: 'facturabel' }, // 120 min
  { id: 'eb_do', dagNr: 4, start: '19:30', eind: '21:30', soort: 'platform' }, // 120 min
]; // gepland werkTotaal = 240 min

const DREMPEL = { wekenOpRij: 2, pctBovenSchema: 25 }; // drempel = 300 min

function maandagNWekenGeleden(n) {
  const d = new Date(maandagVan(new Date().toISOString()));
  d.setDate(d.getDate() - n * 7);
  return d.toISOString().slice(0, 10);
}

function sessieOp(datum, minuten, categorie = 'facturabel') {
  return { id: `${datum}_${categorie}`, datum, minuten, categorie };
}

describe('koppeling6_eigenBedrijfOverschrijding', () => {
  it('geeft null als de koppeling uitstaat', () => {
    const sessies = [sessieOp(maandagNWekenGeleden(1), 320), sessieOp(maandagNWekenGeleden(2), 320)];
    expect(koppeling6_eigenBedrijfOverschrijding(sessies, BLOKKEN, DREMPEL, false)).toBeNull();
  });

  it('geeft null zonder gepland werk (geen blokken)', () => {
    const sessies = [sessieOp(maandagNWekenGeleden(1), 320)];
    expect(koppeling6_eigenBedrijfOverschrijding(sessies, [], DREMPEL, true)).toBeNull();
  });

  it('geeft een signaal bij precies "wekenOpRij" afgeronde weken boven de drempel', () => {
    const sessies = [sessieOp(maandagNWekenGeleden(1), 320), sessieOp(maandagNWekenGeleden(2), 320)];
    const signaal = koppeling6_eigenBedrijfOverschrijding(sessies, BLOKKEN, DREMPEL, true);
    expect(signaal).not.toBeNull();
    expect(signaal.bron).toBe('werk');
    expect(signaal.doel).toBe('werk');
  });

  it('geeft null bij maar één week boven de drempel', () => {
    const sessies = [sessieOp(maandagNWekenGeleden(1), 320)];
    expect(koppeling6_eigenBedrijfOverschrijding(sessies, BLOKKEN, DREMPEL, true)).toBeNull();
  });

  it('negeert de lopende (niet-afgeronde) week', () => {
    const huidigeWeek = maandagVan(new Date().toISOString());
    const sessies = [
      sessieOp(huidigeWeek, 1000), // lopende week, telt niet mee
      sessieOp(maandagNWekenGeleden(1), 320),
    ];
    expect(koppeling6_eigenBedrijfOverschrijding(sessies, BLOKKEN, DREMPEL, true)).toBeNull();
  });

  it('een lege week (geen sessies) breekt de reeks niet', () => {
    // Week -1 heeft geen sessies (wordt overgeslagen), -2 en -3 zitten boven de drempel.
    const sessies = [sessieOp(maandagNWekenGeleden(2), 320), sessieOp(maandagNWekenGeleden(3), 320)];
    const signaal = koppeling6_eigenBedrijfOverschrijding(sessies, BLOKKEN, DREMPEL, true);
    expect(signaal).not.toBeNull();
  });

  it('een week onder de drempel (maar mét gelogde tijd) breekt de reeks', () => {
    const sessies = [
      sessieOp(maandagNWekenGeleden(1), 320),
      sessieOp(maandagNWekenGeleden(2), 100), // onder de drempel, wél gelogd -> breekt de reeks
      sessieOp(maandagNWekenGeleden(3), 320),
    ];
    expect(koppeling6_eigenBedrijfOverschrijding(sessies, BLOKKEN, DREMPEL, true)).toBeNull();
  });
});
