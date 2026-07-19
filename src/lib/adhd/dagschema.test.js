import { describe, it, expect } from 'vitest';
import { genereerDagschema } from './dagschema.js';

const VENSTER = { starttijd: '09:00', eindtijd: '17:00' };
const LIMIET_MIDDEN = { taken: 5, blok: 45, uren: 6 };

describe('genereerDagschema', () => {
  it('plant taken zwaarste-eerst', () => {
    const taken = [
      { id: 'licht', focusMinuten: 15 },
      { id: 'zwaar', focusMinuten: 90 },
      { id: 'middel', focusMinuten: 45 },
    ];
    const { blokken } = genereerDagschema(taken, VENSTER, LIMIET_MIDDEN);
    const werkblokken = blokken.filter((b) => b.type === 'werk');
    expect(werkblokken.map((b) => b.taak.id)).toEqual(['zwaar', 'middel', 'licht']);
  });

  it('gebruikt de blokduur uit de daglimiet voor elk werkblok', () => {
    const taken = [{ id: 'a', focusMinuten: 10 }, { id: 'b', focusMinuten: 10 }];
    const { blokken } = genereerDagschema(taken, VENSTER, LIMIET_MIDDEN);
    const werkblokken = blokken.filter((b) => b.type === 'werk');
    expect(werkblokken[0]).toMatchObject({ start: '09:00', eind: '09:45' });
    expect(werkblokken[1]).toMatchObject({ start: '09:50', eind: '10:35' }); // na 5 min korte pauze
  });

  it('voegt een korte pauze toe na een werkblok en een lange pauze na elke 4e', () => {
    const taken = Array.from({ length: 5 }, (_, i) => ({ id: `t${i}`, focusMinuten: 20 }));
    const limiet = { taken: 5, blok: 25, uren: 8 };
    const { blokken } = genereerDagschema(taken, VENSTER, limiet);
    const pauzes = blokken.filter((b) => b.type === 'pauze');
    expect(pauzes).toHaveLength(4);
    expect(pauzes.slice(0, 3).every((p) => !p.lang)).toBe(true);
    expect(pauzes[3].lang).toBe(true);
  });

  it('stopt bij de taken-cap uit de daglimiet, rest blijft "niet ingepland"', () => {
    const taken = Array.from({ length: 6 }, (_, i) => ({ id: `t${i}`, focusMinuten: 20 }));
    const limiet = { taken: 2, blok: 25, uren: 8 };
    const { blokken, nietIngepland } = genereerDagschema(taken, VENSTER, limiet);
    expect(blokken.filter((b) => b.type === 'werk')).toHaveLength(2);
    expect(nietIngepland).toHaveLength(4);
  });

  it('stopt bij de uren-cap uit de daglimiet', () => {
    const taken = Array.from({ length: 10 }, (_, i) => ({ id: `t${i}`, focusMinuten: 20 }));
    const limiet = { taken: 20, blok: 60, uren: 2 }; // max 2 werkblokken van 60 min passen in 2 uur
    const { blokken, nietIngepland } = genereerDagschema(taken, VENSTER, limiet);
    expect(blokken.filter((b) => b.type === 'werk')).toHaveLength(2);
    expect(nietIngepland).toHaveLength(8);
  });

  it('stopt zodra het werkvenster (eindtijd) vol is', () => {
    const taken = Array.from({ length: 20 }, (_, i) => ({ id: `t${i}`, focusMinuten: 20 }));
    const kortVenster = { starttijd: '16:00', eindtijd: '17:00' };
    const limiet = { taken: 20, blok: 45, uren: 8 };
    const { blokken, nietIngepland } = genereerDagschema(taken, kortVenster, limiet);
    const werkblokken = blokken.filter((b) => b.type === 'werk');
    expect(werkblokken.length).toBeGreaterThan(0);
    werkblokken.forEach((b) => expect(b.eind <= '17:00').toBe(true));
    expect(nietIngepland.length).toBeGreaterThan(0);
  });

  it('geeft een leeg schema zonder crash als er geen open taken zijn', () => {
    const { blokken, nietIngepland } = genereerDagschema([], VENSTER, LIMIET_MIDDEN);
    expect(blokken).toEqual([]);
    expect(nietIngepland).toEqual([]);
  });

  it('plant geen pauze na het allerlaatste werkblok', () => {
    const taken = [{ id: 'a', focusMinuten: 10 }];
    const { blokken } = genereerDagschema(taken, VENSTER, LIMIET_MIDDEN);
    expect(blokken).toHaveLength(1);
    expect(blokken[0].type).toBe('werk');
  });

  it('behandelt een ontbrekend focusMinuten-veld als het lichtst (laatste in de volgorde)', () => {
    const taken = [
      { id: 'zonder-schatting' },
      { id: 'met-schatting', focusMinuten: 30 },
    ];
    const { blokken } = genereerDagschema(taken, VENSTER, LIMIET_MIDDEN);
    const werkblokken = blokken.filter((b) => b.type === 'werk');
    expect(werkblokken.map((b) => b.taak.id)).toEqual(['met-schatting', 'zonder-schatting']);
  });
});
