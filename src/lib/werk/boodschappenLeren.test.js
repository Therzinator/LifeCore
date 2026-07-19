import { describe, it, expect } from 'vitest';
import { detecteerFavorieten } from './boodschappenLeren.js';

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
