import { describe, it, expect } from 'vitest';
import { detecteerFavorieten, detecteerPopulair } from './boodschappenLeren.js';

function beurt(datum, items) {
  return { datum, items };
}

describe('detecteerFavorieten', () => {
  it('herkent een item dat elke week (~7 dagen) gekocht wordt', () => {
    const beurten = [
      beurt('2026-01-01', [{ tekst: 'Melk', aantal: 1 }]),
      beurt('2026-01-08', [{ tekst: 'Melk', aantal: 1 }]),
      beurt('2026-01-15', [{ tekst: 'Melk', aantal: 1 }]),
    ];
    const { wekelijks, maandelijks } = detecteerFavorieten(beurten);
    expect(wekelijks.map((i) => i.tekst)).toEqual(['Melk']);
    expect(maandelijks).toEqual([]);
  });

  it('herkent een item dat elke maand (~30 dagen) gekocht wordt', () => {
    const beurten = [
      beurt('2026-01-01', [{ tekst: 'Wc-papier', aantal: 1 }]),
      beurt('2026-01-31', [{ tekst: 'Wc-papier', aantal: 1 }]),
    ];
    const { wekelijks, maandelijks } = detecteerFavorieten(beurten);
    expect(wekelijks).toEqual([]);
    expect(maandelijks.map((i) => i.tekst)).toEqual(['Wc-papier']);
  });

  it('classificeert een item met te weinig data (1 aankoop) niet als favoriet', () => {
    const beurten = [beurt('2026-01-01', [{ tekst: 'Eenmalig ding', aantal: 1 }])];
    const { wekelijks, maandelijks } = detecteerFavorieten(beurten);
    expect(wekelijks).toEqual([]);
    expect(maandelijks).toEqual([]);
  });

  it('classificeert een item met een interval tussen wekelijks en maandelijks (bv. ~15 dagen) niet als favoriet', () => {
    const beurten = [
      beurt('2026-01-01', [{ tekst: 'Tussenin', aantal: 1 }]),
      beurt('2026-01-16', [{ tekst: 'Tussenin', aantal: 1 }]),
      beurt('2026-01-31', [{ tekst: 'Tussenin', aantal: 1 }]),
    ];
    const { wekelijks, maandelijks } = detecteerFavorieten(beurten);
    expect(wekelijks).toEqual([]);
    expect(maandelijks).toEqual([]);
  });

  it('groepeert dezelfde tekst ongeacht hoofdletters/spaties', () => {
    const beurten = [
      beurt('2026-01-01', [{ tekst: 'Melk', aantal: 1 }]),
      beurt('2026-01-08', [{ tekst: ' melk ', aantal: 1 }]),
      beurt('2026-01-15', [{ tekst: 'MELK', aantal: 1 }]),
    ];
    const { wekelijks } = detecteerFavorieten(beurten);
    expect(wekelijks).toHaveLength(1);
    expect(wekelijks[0].aantalKeer).toBe(3);
  });

  it('sorteert favorieten op aantal keer gekocht, meest frequent eerst', () => {
    const beurten = [
      beurt('2026-01-01', [{ tekst: 'A', aantal: 1 }, { tekst: 'B', aantal: 1 }]),
      beurt('2026-01-08', [{ tekst: 'A', aantal: 1 }, { tekst: 'B', aantal: 1 }]),
      beurt('2026-01-15', [{ tekst: 'A', aantal: 1 }]),
      beurt('2026-01-22', [{ tekst: 'A', aantal: 1 }]),
    ];
    const { wekelijks } = detecteerFavorieten(beurten);
    expect(wekelijks.map((i) => i.tekst)).toEqual(['A', 'B']);
  });

  it('geeft lege lijsten zonder crash bij geen beurten', () => {
    expect(detecteerFavorieten([])).toEqual({ wekelijks: [], maandelijks: [] });
  });
});

describe('detecteerPopulair', () => {
  it('herkent een item dat vaak maar onregelmatig gekocht wordt', () => {
    // Intervallen 2 / 58 / 15 dagen -> mediaan 15, buiten zowel de wekelijkse
    // (4-10) als maandelijkse (20-40) bandbreedte.
    const beurten = [
      beurt('2026-01-01', [{ tekst: 'Wc-papier grootverpakking', aantal: 1 }]),
      beurt('2026-01-03', [{ tekst: 'Wc-papier grootverpakking', aantal: 1 }]),
      beurt('2026-03-02', [{ tekst: 'Wc-papier grootverpakking', aantal: 1 }]),
      beurt('2026-03-17', [{ tekst: 'Wc-papier grootverpakking', aantal: 1 }]),
    ];
    const populair = detecteerPopulair(beurten);
    expect(populair.map((i) => i.tekst)).toEqual(['Wc-papier grootverpakking']);
    expect(populair[0].aantalKeer).toBe(4);
  });

  it('laat een item met minder dan 3 aankopen niet meetellen', () => {
    const beurten = [
      beurt('2026-01-01', [{ tekst: 'Zeldzaam ding', aantal: 1 }]),
      beurt('2026-01-20', [{ tekst: 'Zeldzaam ding', aantal: 1 }]),
    ];
    expect(detecteerPopulair(beurten)).toEqual([]);
  });

  it('sluit items uit die al als wekelijkse of maandelijkse favoriet herkend zijn', () => {
    const beurten = [
      beurt('2026-01-01', [{ tekst: 'Melk', aantal: 1 }]),
      beurt('2026-01-08', [{ tekst: 'Melk', aantal: 1 }]),
      beurt('2026-01-15', [{ tekst: 'Melk', aantal: 1 }]),
    ];
    expect(detecteerPopulair(beurten)).toEqual([]);
  });

  it('sorteert op aantal keer gekocht en beperkt tot de top 8', () => {
    function isoPlusDagen(basis, dagen) {
      const d = new Date(basis);
      d.setDate(d.getDate() + dagen);
      return d.toISOString().slice(0, 10);
    }

    // 10 items, elk met een oplopend, onderling verschillend aantal aankopen
    // (3 t/m 12) op een bewust onregelmatig patroon (afwisselend 1 en 200
    // dagen ertussen) — dat interval-patroon valt buiten zowel de wekelijkse
    // (4-10 dagen) als maandelijkse (20-40 dagen) bandbreedte, dus elk item
    // komt bij detecteerPopulair terecht i.p.v. bij de favorieten.
    const beurten = Array.from({ length: 10 }, (_, i) => {
      const aantalKeer = i + 3;
      return Array.from({ length: aantalKeer }, (_, k) => (
        beurt(isoPlusDagen('2026-01-01', k % 2 === 0 ? k * 1 : k * 200), [{ tekst: `Item${i}`, aantal: 1 }])
      ));
    }).flat();

    const populair = detecteerPopulair(beurten);
    expect(populair.length).toBe(8);
    const aantallen = populair.map((i) => i.aantalKeer);
    expect(aantallen).toEqual([...aantallen].sort((a, b) => b - a));
    // De twee items met de minste aankopen (3 en 4 keer) vallen buiten de top 8.
    expect(populair.map((i) => i.tekst)).not.toContain('Item0');
    expect(populair.map((i) => i.tekst)).not.toContain('Item1');
  });
});
