import { describe, it, expect } from 'vitest';
import { REQ_DIMENSIES } from '../src/lib/welzijn/req.js';

describe('REQ_DIMENSIES', () => {
  it('heeft vier dimensies van elk twee items', () => {
    expect(REQ_DIMENSIES).toHaveLength(4);
    for (const dim of REQ_DIMENSIES) {
      expect(dim.items).toHaveLength(2);
    }
  });

  it('elke dimensie is positief gericht (hoger = meer herstel) en tweewekelijks geframed', () => {
    for (const dim of REQ_DIMENSIES) {
      expect(dim.richting).toBe('positief');
      expect(dim.sectie).toBe('herstel');
      for (const item of dim.items) {
        expect(item).toMatch(/afgelopen twee weken/);
      }
    }
  });
});
