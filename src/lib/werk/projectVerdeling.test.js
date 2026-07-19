import { describe, it, expect } from 'vitest';
import {
  verdeelKlusjesOverMaanden, groepeerPerMaand, maandLabel, dagenTotDeadline, berekenGeschatteUren, isGeblokkeerd,
  alleItemsVanProject, vereisteOpties,
} from './projectVerdeling.js';

describe('isGeblokkeerd', () => {
  const klusjes = [
    { id: 'a', afgerond: false },
    { id: 'b', afgerond: true },
  ];

  it('is niet geblokkeerd zonder vereiste', () => {
    expect(isGeblokkeerd({ id: 'c', vereistKlusjeId: null }, klusjes)).toBe(false);
  });

  it('is geblokkeerd als de vereiste nog niet is afgerond', () => {
    expect(isGeblokkeerd({ id: 'c', vereistKlusjeId: 'a' }, klusjes)).toBe(true);
  });

  it('is niet geblokkeerd als de vereiste al is afgerond', () => {
    expect(isGeblokkeerd({ id: 'c', vereistKlusjeId: 'b' }, klusjes)).toBe(false);
  });

  it('is niet geblokkeerd als de vereiste niet meer bestaat', () => {
    expect(isGeblokkeerd({ id: 'c', vereistKlusjeId: 'weg' }, klusjes)).toBe(false);
  });
});

describe('alleItemsVanProject', () => {
  it('platst klusjes en hun stappen tot één lijst, met klusjeId per item', () => {
    const klusjes = [
      { id: 'k1', tekst: 'Schuur', afgerond: false, subklusjes: [{ id: 's1', tekst: 'Sorteren', afgerond: true }] },
      { id: 'k2', tekst: 'Tuin', afgerond: false, subklusjes: [] },
    ];
    const items = alleItemsVanProject(klusjes);
    expect(items).toHaveLength(3);
    expect(items.find((i) => i.id === 'k1')).toMatchObject({ klusjeId: 'k1', isStap: false });
    expect(items.find((i) => i.id === 's1')).toMatchObject({ klusjeId: 'k1', isStap: true, afgerond: true });
    expect(items.find((i) => i.id === 's1').tekst).toContain('Schuur');
    expect(items.find((i) => i.id === 's1').tekst).toContain('Sorteren');
  });
});

describe('vereisteOpties', () => {
  const klusjes = [
    { id: 'k1', tekst: 'Schuur', subklusjes: [{ id: 's1', tekst: 'Sorteren' }, { id: 's2', tekst: 'Schilderen' }] },
    { id: 'k2', tekst: 'Tuin', subklusjes: [] },
  ];

  it('laat een klusje niet afhangen van zijn eigen stap', () => {
    const opties = vereisteOpties(klusjes, 'k1', 'k1');
    expect(opties.some((o) => o.id === 's1' || o.id === 's2')).toBe(false);
    expect(opties.some((o) => o.id === 'k2')).toBe(true);
  });

  it('laat een stap niet afhangen van zijn eigen ouder-klusje', () => {
    const opties = vereisteOpties(klusjes, 's1', 'k1');
    expect(opties.some((o) => o.id === 'k1')).toBe(false);
  });

  it('laat een stap wel afhangen van een sibling-stap binnen hetzelfde klusje', () => {
    const opties = vereisteOpties(klusjes, 's2', 'k1');
    expect(opties.some((o) => o.id === 's1')).toBe(true);
  });

  it('laat een stap afhangen van een ander klusje of diens stap', () => {
    const opties = vereisteOpties(klusjes, 's1', 'k1');
    expect(opties.some((o) => o.id === 'k2')).toBe(true);
  });

  it('sluit het item zelf altijd uit', () => {
    const opties = vereisteOpties(klusjes, 's1', 'k1');
    expect(opties.some((o) => o.id === 's1')).toBe(false);
  });
});

describe('berekenGeschatteUren', () => {
  it('gebruikt het handmatig ingestelde geschatteUren zonder stappen', () => {
    expect(berekenGeschatteUren({ geschatteUren: 3, subklusjes: [] })).toBe(3);
    expect(berekenGeschatteUren({ subklusjes: [] })).toBe(1);
  });

  it('telt de duur van de stappen op als er stappen zijn, ongeacht geschatteUren', () => {
    const klusje = {
      geschatteUren: 5,
      subklusjes: [{ id: 'a', duurUren: 1 }, { id: 'b', duurUren: 0.5 }],
    };
    expect(berekenGeschatteUren(klusje)).toBe(1.5);
  });

  it('valt terug op 0.5u per stap zonder eigen duurUren', () => {
    const klusje = { subklusjes: [{ id: 'a' }, { id: 'b', duurUren: 1 }] };
    expect(berekenGeschatteUren(klusje)).toBe(1.5);
  });
});

describe('verdeelKlusjesOverMaanden', () => {
  it('verdeelt gelijke klusjes zo gelijkmatig mogelijk over de maanden', () => {
    const klusjes = Array.from({ length: 6 }, (_, i) => ({ id: `k${i}`, tekst: `Klus ${i}`, geschatteUren: 2 }));
    const verdeeld = verdeelKlusjesOverMaanden(klusjes, 3, '2026-01');
    const perMaand = groepeerPerMaand(verdeeld);
    expect(perMaand).toHaveLength(3);
    perMaand.forEach(([, lijst]) => expect(lijst).toHaveLength(2));
  });

  it('balanceert de totale belasting per maand bij ongelijke klusjes (LPT)', () => {
    const klusjes = [
      { id: 'a', geschatteUren: 8 },
      { id: 'b', geschatteUren: 1 },
      { id: 'c', geschatteUren: 1 },
      { id: 'd', geschatteUren: 6 },
    ];
    const verdeeld = verdeelKlusjesOverMaanden(klusjes, 2, '2026-01');
    const perMaand = groepeerPerMaand(verdeeld);
    const belastingen = perMaand.map(([, lijst]) => lijst.reduce((s, k) => s + k.geschatteUren, 0));
    // Optimale verdeling: {8} vs {6,1,1} = 8 vs 8 — perfect gebalanceerd.
    expect(Math.max(...belastingen) - Math.min(...belastingen)).toBeLessThanOrEqual(2);
  });

  it('gebruikt startMaand en telt maanden correct door, ook over een jaargrens', () => {
    const klusjes = [{ id: 'a', geschatteUren: 1 }, { id: 'b', geschatteUren: 1 }, { id: 'c', geschatteUren: 1 }];
    const verdeeld = verdeelKlusjesOverMaanden(klusjes, 3, '2026-11');
    const maanden = [...new Set(verdeeld.map((k) => k.maand))].sort();
    expect(maanden).toEqual(['2026-11', '2026-12', '2027-01']);
  });

  it('werkt met één maand (alles in dezelfde maand)', () => {
    const klusjes = [{ id: 'a', geschatteUren: 3 }, { id: 'b', geschatteUren: 5 }];
    const verdeeld = verdeelKlusjesOverMaanden(klusjes, 1, '2026-01');
    expect(verdeeld.every((k) => k.maand === '2026-01')).toBe(true);
  });

  it('valt terug op gewicht 1 als geschatteUren ontbreekt', () => {
    const klusjes = [{ id: 'a' }, { id: 'b' }];
    const verdeeld = verdeelKlusjesOverMaanden(klusjes, 2, '2026-01');
    const perMaand = groepeerPerMaand(verdeeld);
    expect(perMaand).toHaveLength(2);
  });

  it('plant een klusje nooit vóór zijn vereiste, ook al zou pure LPT dat wel doen', () => {
    // 'b' is veruit het zwaarst en zou zonder de vereiste als eerste (dus
    // vroegste maand) worden ingepland — maar 'b' vereist 'a', dus 'a' moet
    // even ver naar voren schuiven en 'b' mag niet eerder dan 'a' liggen.
    const klusjes = [
      { id: 'a', geschatteUren: 1 },
      { id: 'b', geschatteUren: 10, vereistKlusjeId: 'a' },
      { id: 'c', geschatteUren: 5 },
    ];
    const verdeeld = verdeelKlusjesOverMaanden(klusjes, 3, '2026-01');
    const maandVan = (id) => verdeeld.find((k) => k.id === id).maand;
    expect(maandVan('a') <= maandVan('b')).toBe(true);
  });

  it('respecteert een keten van vereisten (a -> b -> c)', () => {
    const klusjes = [
      { id: 'a', geschatteUren: 3 },
      { id: 'b', geschatteUren: 8, vereistKlusjeId: 'a' },
      { id: 'c', geschatteUren: 2, vereistKlusjeId: 'b' },
    ];
    const verdeeld = verdeelKlusjesOverMaanden(klusjes, 4, '2026-01');
    const maandVan = (id) => verdeeld.find((k) => k.id === id).maand;
    expect(maandVan('a') <= maandVan('b')).toBe(true);
    expect(maandVan('b') <= maandVan('c')).toBe(true);
  });

  it('negeert een vereiste die niet meer bestaat zonder te crashen', () => {
    const klusjes = [{ id: 'a', geschatteUren: 2, vereistKlusjeId: 'weg' }];
    expect(() => verdeelKlusjesOverMaanden(klusjes, 2, '2026-01')).not.toThrow();
  });

  it('een stap die een ANDER klusje vereist, schuift het eigen klusje niet vóór dat andere klusje', () => {
    // Klusje 'a' heeft een stap die klusje 'b' vereist — dus 'a' mag niet
    // vóór 'b' ingepland staan, ook al is er geen vereiste op klusje-niveau.
    const klusjes = [
      { id: 'a', geschatteUren: 10, subklusjes: [{ id: 'a1', vereistKlusjeId: 'b' }] },
      { id: 'b', geschatteUren: 1 },
    ];
    const verdeeld = verdeelKlusjesOverMaanden(klusjes, 3, '2026-01');
    const maandVan = (id) => verdeeld.find((k) => k.id === id).maand;
    expect(maandVan('b') <= maandVan('a')).toBe(true);
  });

  it('een stap die een stap van een ander klusje vereist, telt ook mee op klusje-niveau', () => {
    const klusjes = [
      { id: 'a', geschatteUren: 10, subklusjes: [{ id: 'a1', vereistKlusjeId: 'b1' }] },
      { id: 'b', geschatteUren: 1, subklusjes: [{ id: 'b1' }] },
    ];
    const verdeeld = verdeelKlusjesOverMaanden(klusjes, 3, '2026-01');
    const maandVan = (id) => verdeeld.find((k) => k.id === id).maand;
    expect(maandVan('b') <= maandVan('a')).toBe(true);
  });

  it('een klusje met prioriteit claimt de vroegste maand vóór een zwaarder, niet-prioritair klusje', () => {
    const klusjes = [
      { id: 'a', geschatteUren: 1, prioriteit: true },
      { id: 'b', geschatteUren: 10 },
    ];
    const verdeeld = verdeelKlusjesOverMaanden(klusjes, 3, '2026-01');
    const maandVan = (id) => verdeeld.find((k) => k.id === id).maand;
    expect(maandVan('a') <= maandVan('b')).toBe(true);
  });

  it('prioriteit respecteert nog steeds een "Taak kan pas na"-vereiste', () => {
    const klusjes = [
      { id: 'a', geschatteUren: 1, prioriteit: true, vereistKlusjeId: 'b' },
      { id: 'b', geschatteUren: 1 },
    ];
    const verdeeld = verdeelKlusjesOverMaanden(klusjes, 3, '2026-01');
    const maandVan = (id) => verdeeld.find((k) => k.id === id).maand;
    expect(maandVan('b') <= maandVan('a')).toBe(true);
  });

  it('een stap die een SIBLING-stap binnen hetzelfde klusje vereist, verandert de maand-planning niet', () => {
    const klusjes = [
      { id: 'a', geschatteUren: 3, subklusjes: [{ id: 'a1' }, { id: 'a2', vereistKlusjeId: 'a1' }] },
      { id: 'b', geschatteUren: 3 },
    ];
    const zonder = verdeelKlusjesOverMaanden(
      [{ id: 'a', geschatteUren: 3, subklusjes: [{ id: 'a1' }, { id: 'a2' }] }, { id: 'b', geschatteUren: 3 }],
      2, '2026-01',
    );
    const met = verdeelKlusjesOverMaanden(klusjes, 2, '2026-01');
    expect(met.find((k) => k.id === 'a').maand).toBe(zonder.find((k) => k.id === 'a').maand);
  });
});

describe('maandLabel', () => {
  it('formatteert een maand-key als leesbare Nederlandse tekst', () => {
    expect(maandLabel('2026-03')).toMatch(/maart/i);
    expect(maandLabel('2026-03')).toContain('2026');
  });
});

describe('dagenTotDeadline', () => {
  it('geeft null zonder deadline', () => {
    expect(dagenTotDeadline(null, '2026-07-19')).toBeNull();
  });

  it('telt dagen tot een toekomstige deadline', () => {
    expect(dagenTotDeadline('2026-07-29', '2026-07-19')).toBe(10);
  });

  it('geeft 0 op de deadline zelf', () => {
    expect(dagenTotDeadline('2026-07-19', '2026-07-19')).toBe(0);
  });

  it('geeft een negatief getal voor een verlopen deadline', () => {
    expect(dagenTotDeadline('2026-07-10', '2026-07-19')).toBe(-9);
  });

  it('telt correct over een jaargrens en een DST-overgang heen', () => {
    expect(dagenTotDeadline('2027-01-01', '2026-12-30')).toBe(2);
    // 2026-10-25 -> 2026-11-01: bevat de NL-DST-overgang (laatste zondag oktober).
    expect(dagenTotDeadline('2026-11-01', '2026-10-25')).toBe(7);
  });
});
