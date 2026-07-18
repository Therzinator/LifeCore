import { describe, it, expect } from 'vitest';
import { dagLimiet } from '../src/lib/adhd/dagLimiet.js';

describe('dagLimiet', () => {
  it('geeft minder taken en een korter focusblok bij lage energie', () => {
    expect(dagLimiet('laag')).toEqual({ taken: 3, blok: 25 });
  });

  it('geeft meer taken en een langer focusblok bij hoge energie', () => {
    expect(dagLimiet('hoog')).toEqual({ taken: 7, blok: 90 });
  });

  it('valt terug op midden zonder bekend energieniveau', () => {
    expect(dagLimiet(undefined)).toEqual({ taken: 5, blok: 45 });
    expect(dagLimiet('onbekend')).toEqual({ taken: 5, blok: 45 });
  });
});
