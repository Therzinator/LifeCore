import { describe, it, expect } from 'vitest';
import { clusterBrainDump } from '../src/lib/ochtend/brainCluster.js';

describe('clusterBrainDump', () => {
  it('geeft lege clusters bij te korte of lege tekst', () => {
    expect(clusterBrainDump('')).toEqual({ zorgen: [], taken: [], ideeen: [] });
    expect(clusterBrainDump('kort')).toEqual({ zorgen: [], taken: [], ideeen: [] });
  });

  it('herkent zorgen op keywords', () => {
    const result = clusterBrainDump('Ik ben nerveus over het gesprek morgen.');
    expect(result.zorgen).toHaveLength(1);
    expect(result.zorgen[0]).toContain('nerveus');
  });

  it('herkent taken op keywords', () => {
    const result = clusterBrainDump('Ik moet nog de tandarts bellen.');
    expect(result.taken).toHaveLength(1);
    expect(result.taken[0]).toContain('bellen');
  });

  it('plaatst overige zinnen bij ideeën', () => {
    const result = clusterBrainDump('Misschien een keer weer gaan schilderen.');
    expect(result.ideeen).toHaveLength(1);
  });

  it('splitst meerdere zinnen correct over clusters', () => {
    const tekst = 'Ik ben bang dat ik het vergeet. Ik moet nog mailen naar Sanne. Leuk idee voor het weekend misschien.';
    const result = clusterBrainDump(tekst);
    expect(result.zorgen.length).toBeGreaterThanOrEqual(1);
    expect(result.taken.length).toBeGreaterThanOrEqual(1);
    expect(result.ideeen.length).toBeGreaterThanOrEqual(1);
  });

  it('negeert erg korte fragmenten (<=3 tekens)', () => {
    const result = clusterBrainDump('Ok. Ja. Nee. Ik moet nog boodschappen doen vandaag.');
    const totaal = result.zorgen.length + result.taken.length + result.ideeen.length;
    expect(totaal).toBe(1);
  });
});
