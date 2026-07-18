import { describe, it, expect } from 'vitest';
import { OEFENINGEN_BIBLIOTHEEK } from '../src/lib/training/schema.js';

describe('OEFENINGEN_BIBLIOTHEEK', () => {
  it('elke preset heeft alle velden nodig om direct aan een training toe te voegen', () => {
    for (const oef of OEFENINGEN_BIBLIOTHEEK) {
      expect(oef.id).toBeTruthy();
      expect(oef.naam).toBeTruthy();
      expect(oef.categorie).toBeTruthy();
      expect(oef.sets).toBeGreaterThan(0);
      expect(oef.reps).toBeGreaterThan(0);
      expect(['zw', 'li']).toContain(oef.type);
      expect(['recht', 'curl']).toContain(oef.stangType);
      expect(oef.increment).toBeGreaterThan(0);
    }
  });

  it('heeft geen dubbele ids', () => {
    const ids = OEFENINGEN_BIBLIOTHEEK.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
