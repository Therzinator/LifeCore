import { describe, it, expect } from 'vitest';
import { CBI_SUBSCHALEN } from '../src/lib/welzijn/cbi.js';

describe('CBI_SUBSCHALEN', () => {
  it('heeft alleen persoonlijke en werkgerelateerde uitputting (geen cliëntgerelateerde schaal)', () => {
    expect(CBI_SUBSCHALEN.map((s) => s.id)).toEqual(['persoonlijk', 'werk']);
  });

  it('elke subschaal is negatief gericht (hoger = meer uitputting) en heeft items', () => {
    for (const sub of CBI_SUBSCHALEN) {
      expect(sub.richting).toBe('negatief');
      expect(sub.sectie).toBe('burnout');
      expect(sub.items.length).toBeGreaterThan(0);
    }
  });
});
