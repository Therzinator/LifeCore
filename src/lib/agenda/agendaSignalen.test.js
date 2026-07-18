import { describe, it, expect } from 'vitest';
import { trainingCardioSignalen, werkdagSignalen, welzijnSignaal, huishoudProjectSignalen } from './agendaSignalen.js';

describe('trainingCardioSignalen', () => {
  it('markeert liftdagen (ma/wo/vr) en cardiodagen (di/do/za) binnen het bereik', () => {
    // 2026-07-13 is een maandag.
    const signalen = trainingCardioSignalen('2026-07-13', '2026-07-19');
    const perType = Object.fromEntries(signalen.map((s) => [s.datum, s.type]));
    expect(perType['2026-07-13']).toBe('lift'); // ma
    expect(perType['2026-07-14']).toBe('cardio'); // di
    expect(perType['2026-07-19']).toBeUndefined(); // zo = rust, geen signaal
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
