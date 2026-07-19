import { describe, it, expect } from 'vitest';
import { kompasScores, kompasTrend, KOMPAS_DOMEINEN } from '../src/lib/act/kompas.js';

describe('kompasScores', () => {
  it('haalt de score per domein uit de antwoorden', () => {
    const antwoorden = { werk: { waarde: 'iets', score: 7 }, vrijeTijd: { waarde: 'iets', score: 4 } };
    const scores = kompasScores(antwoorden);
    expect(scores.werk).toBe(7);
    expect(scores.vrijeTijd).toBe(4);
  });

  it('geeft null voor een domein zonder ingevulde score', () => {
    const scores = kompasScores({});
    KOMPAS_DOMEINEN.forEach((d) => expect(scores[d.id]).toBeNull());
  });
});

describe('kompasTrend', () => {
  it('geeft null zonder vorige invulling', () => {
    expect(kompasTrend({ werk: 5 }, null)).toBeNull();
  });

  it('herkent dichterbij, verder en gelijk per domein', () => {
    const laatste = { werk: 8, vrijeTijd: 3, relaties: 5, groei: 5 };
    const vorige = { werk: 5, vrijeTijd: 6, relaties: 5, groei: 5 };
    const trend = kompasTrend(laatste, vorige);
    expect(trend.werk).toBe('dichterbij');
    expect(trend.vrijeTijd).toBe('verder');
    expect(trend.relaties).toBe('gelijk');
  });

  it('geeft null voor een domein zonder score aan beide kanten', () => {
    const trend = kompasTrend({ werk: 8 }, { werk: 5 });
    expect(trend.vrijeTijd).toBeNull();
  });
});
