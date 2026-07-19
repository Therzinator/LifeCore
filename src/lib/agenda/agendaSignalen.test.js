import { describe, it, expect } from 'vitest';
import {
  trainingCardioSignalen, werkdagSignalen, welzijnSignaal, huishoudProjectSignalen, klusjesDagSignalen,
} from './agendaSignalen.js';

describe('trainingCardioSignalen', () => {
  it('markeert liftdagen (ma/wo/vr) en cardiodagen (di/do/za) binnen het bereik', () => {
    // 2026-07-13 is een maandag.
    const signalen = trainingCardioSignalen('2026-07-13', '2026-07-19');
    const perType = Object.fromEntries(signalen.map((s) => [s.datum, s.type]));
    expect(perType['2026-07-13']).toBe('lift'); // ma
    expect(perType['2026-07-14']).toBe('cardio'); // di
    expect(perType['2026-07-19']).toBeUndefined(); // zo = rust, geen signaal
  });

  it('geeft ochtend/middag/avond-tijdopties mee, standaard of aangepast', () => {
    const standaard = trainingCardioSignalen('2026-07-13', '2026-07-13');
    expect(standaard[0].tijdOpties.map((o) => o.starttijd)).toEqual(['07:40', '16:00', '20:00']);

    const aangepast = trainingCardioSignalen('2026-07-13', '2026-07-13', { ochtend: '08:00', middag: '17:00', avond: '21:00' });
    expect(aangepast[0].tijdOpties.map((o) => o.starttijd)).toEqual(['08:00', '17:00', '21:00']);
  });
});

describe('werkdagSignalen', () => {
  it('markeert alleen de ingestelde werkdagen', () => {
    const signalen = werkdagSignalen('2026-07-13', '2026-07-19', [1, 2, 3, 4, 5]);
    expect(signalen).toHaveLength(5);
    expect(signalen.every((s) => s.type === 'werkdag')).toBe(true);
  });

  it('geeft niets terug zonder ingestelde werkdagen', () => {
    expect(werkdagSignalen('2026-07-13', '2026-07-19', [])).toEqual([]);
  });

  it('een vrije-dag-override onderdrukt een werkdag uit het vaste patroon', () => {
    // 2026-07-13 is een maandag, normaal een werkdag met patroon [1..5].
    const signalen = werkdagSignalen('2026-07-13', '2026-07-13', [1, 2, 3, 4, 5], { '2026-07-13': 'vrij' });
    expect(signalen).toHaveLength(1);
    expect(signalen[0].type).toBe('vrij');
  });

  it('een werkdag-override voegt een werkdag toe buiten het vaste patroon', () => {
    // 2026-07-18 is een zaterdag, normaal geen werkdag met patroon [1..5].
    const signalen = werkdagSignalen('2026-07-18', '2026-07-18', [1, 2, 3, 4, 5], { '2026-07-18': 'werkdag' });
    expect(signalen).toHaveLength(1);
    expect(signalen[0].type).toBe('werkdag');
    expect(signalen[0].tekst).toContain('handmatig');
  });

  it('valt terug op het vaste patroon zonder override voor die datum', () => {
    const signalen = werkdagSignalen('2026-07-13', '2026-07-13', [1, 2, 3, 4, 5], { '2026-07-14': 'vrij' });
    expect(signalen).toHaveLength(1);
    expect(signalen[0].type).toBe('werkdag');
  });
});

describe('klusjesDagSignalen', () => {
  it('markeert alleen de ingestelde weekdag', () => {
    // 2026-07-13 is een maandag (ISO-weekdag 1).
    const signalen = klusjesDagSignalen('2026-07-13', '2026-07-19', 1);
    expect(signalen).toHaveLength(1);
    expect(signalen[0].datum).toBe('2026-07-13');
    expect(signalen[0].type).toBe('klusjesdag');
  });

  it('geeft niets terug zonder ingestelde klusjesDag', () => {
    expect(klusjesDagSignalen('2026-07-13', '2026-07-19', null)).toEqual([]);
  });

  it('een klusjesdag-override voegt een dag toe buiten het vaste patroon', () => {
    // 2026-07-18 is een zaterdag, geen match met klusjesDag=1 (maandag).
    const signalen = klusjesDagSignalen('2026-07-18', '2026-07-18', 1, { '2026-07-18': 'klusjesdag' });
    expect(signalen).toHaveLength(1);
    expect(signalen[0].type).toBe('klusjesdag');
  });

  it('een andere override (bv. vrij) onderdrukt het vaste klusjesdag-patroon', () => {
    const signalen = klusjesDagSignalen('2026-07-13', '2026-07-13', 1, { '2026-07-13': 'vrij' });
    expect(signalen).toEqual([]);
  });
});

describe('welzijnSignaal', () => {
  it('geeft de volgende check-datum als signaal', () => {
    const signaal = welzijnSignaal('2026-07-01', 14);
    expect(signaal.datum).toBe('2026-07-15');
    expect(signaal.type).toBe('welzijn');
  });

  it('geeft null als er nog nooit een check is geweest', () => {
    expect(welzijnSignaal(null, 14)).toBeNull();
  });
});

describe('huishoudProjectSignalen', () => {
  it('toont alleen open klusjes binnen het maandbereik', () => {
    const projecten = [{
      naam: 'Schuur',
      klusjes: [
        { id: 'a', tekst: 'sorteren', maand: '2026-07', afgerond: false },
        { id: 'b', tekst: 'schilderen', maand: '2026-08', afgerond: false },
        { id: 'c', tekst: 'al gedaan', maand: '2026-07', afgerond: true },
      ],
    }];
    const signalen = huishoudProjectSignalen(projecten, '2026-07-01', '2026-07-31');
    expect(signalen).toHaveLength(1);
    expect(signalen[0].tekst).toContain('sorteren');
  });
});
