import { describe, it, expect } from 'vitest';
import { checklistPerWeek, CARDIO_ACTIVITEITEN } from '../src/lib/cardio/checklist.js';

describe('CARDIO_ACTIVITEITEN', () => {
  it('bevat precies de 3 vaste activiteiten', () => {
    expect(CARDIO_ACTIVITEITEN.map((a) => a.id)).toEqual(['hardlopen', 'wandelen', 'roeien']);
  });
});

describe('checklistPerWeek', () => {
  it('telt het aantal afgevinkte activiteiten per week op', () => {
    const record = {
      '2026-01-05': { hardlopen: true, wandelen: true },
      '2026-01-06': { roeien: true },
    };
    const { labels, aantalPerWeek } = checklistPerWeek(record);
    expect(labels).toEqual(['2026-01-05']);
    expect(aantalPerWeek).toEqual([3]);
  });

  it('negeert dagen zonder afgevinkte activiteiten, telt niet als gemiste week', () => {
    const record = { '2026-01-05': { hardlopen: false } };
    expect(checklistPerWeek(record).labels).toEqual([]);
  });

  it('geeft lege lijsten bij een leeg record', () => {
    expect(checklistPerWeek({})).toEqual({ labels: [], aantalPerWeek: [] });
  });
});
