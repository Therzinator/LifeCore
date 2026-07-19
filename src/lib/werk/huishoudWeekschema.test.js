import { describe, it, expect } from 'vitest';
import { genereerWeekschema, takenVoorDag } from './huishoudWeekschema.js';

describe('genereerWeekschema', () => {
  it('verdeelt taken ronde-gewijs over de dagen (0=ma..6=zo)', () => {
    const taken = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    expect(genereerWeekschema(taken)).toEqual({ a: 0, b: 1, c: 2 });
  });

  it('wrapt terug naar maandag als er meer dan 7 taken zijn', () => {
    const taken = Array.from({ length: 9 }, (_, i) => ({ id: `t${i}` }));
    const schema = genereerWeekschema(taken);
    expect(schema.t0).toBe(0);
    expect(schema.t7).toBe(0);
    expect(schema.t8).toBe(1);
  });

  it('geeft een lege toewijzing zonder taken', () => {
    expect(genereerWeekschema([])).toEqual({});
  });
});

describe('takenVoorDag', () => {
  it('filtert de taken die op de gegeven dag staan', () => {
    const taken = [{ id: 'a', tekst: 'was' }, { id: 'b', tekst: 'stofzuigen' }];
    const toewijzing = { a: 0, b: 2 };
    expect(takenVoorDag(taken, toewijzing, 0)).toEqual([{ id: 'a', tekst: 'was' }]);
    expect(takenVoorDag(taken, toewijzing, 1)).toEqual([]);
  });
});
