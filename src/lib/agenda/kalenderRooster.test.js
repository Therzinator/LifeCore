import { describe, it, expect } from 'vitest';
import { maandRooster, weekDatums } from './kalenderRooster.js';

describe('maandRooster', () => {
  it('geeft alleen hele weken terug (7 dagen per week)', () => {
    const weken = maandRooster(2026, 7);
    weken.forEach((week) => expect(week).toHaveLength(7));
  });

  it('begint elke week op maandag en bevat de volledige maand', () => {
    const weken = maandRooster(2026, 7);
    const alleDatums = weken.flat().map((d) => d.datum);
    expect(alleDatums).toContain('2026-07-01');
    expect(alleDatums).toContain('2026-07-31');
    expect(weken[0][0].datum <= '2026-07-01').toBe(true);
  });

  it('markeert dagen buiten de maand correct als inMaand: false', () => {
    const weken = maandRooster(2026, 7);
    const buitenMaand = weken.flat().filter((d) => !d.inMaand);
    buitenMaand.forEach((d) => expect(d.datum.startsWith('2026-07')).toBe(false));
  });
});

describe('weekDatums', () => {
  it('geeft 7 opeenvolgende dagen terug, beginnend op maandag', () => {
    const datums = weekDatums('2026-07-16'); // donderdag
    expect(datums).toEqual(['2026-07-13', '2026-07-14', '2026-07-15', '2026-07-16', '2026-07-17', '2026-07-18', '2026-07-19']);
  });
});
