import { describe, it, expect } from 'vitest';
import { instantiesInBereik, pasTijdAan, heeftOverlap, volgendeVrijeTijd } from './agendaBlokken.js';

describe('pasTijdAan', () => {
  it('telt minuten op binnen een etmaal', () => {
    expect(pasTijdAan('18:00', 60)).toBe('19:00');
    expect(pasTijdAan('18:15', 30)).toBe('18:45');
  });

  it('wrapt rond middernacht bij optellen', () => {
    expect(pasTijdAan('23:30', 60)).toBe('00:30');
  });

  it('wrapt rond middernacht bij aftrekken', () => {
    expect(pasTijdAan('00:15', -30)).toBe('23:45');
  });
});

describe('instantiesInBereik', () => {
  it('geeft een eenmalig blok terug binnen bereik', () => {
    const blokken = [{ id: 'a', titel: 'Sporten', datum: '2026-07-15', starttijd: '18:00', eindtijd: '19:00', herhaling: null }];
    expect(instantiesInBereik(blokken, '2026-07-01', '2026-07-31')).toHaveLength(1);
  });

  it('sluit een eenmalig blok buiten bereik uit', () => {
    const blokken = [{ id: 'a', titel: 'Sporten', datum: '2026-08-15', starttijd: '18:00', eindtijd: '19:00', herhaling: null }];
    expect(instantiesInBereik(blokken, '2026-07-01', '2026-07-31')).toHaveLength(0);
  });

  it('genereert wekelijkse herhalingen binnen bereik', () => {
    const blokken = [{ id: 'a', titel: 'Partnertijd', datum: '2026-07-01', starttijd: '20:00', eindtijd: '21:00', herhaling: 'wekelijks' }];
    const instanties = instantiesInBereik(blokken, '2026-07-01', '2026-07-31');
    expect(instanties.map((i) => i.datum)).toEqual(['2026-07-01', '2026-07-08', '2026-07-15', '2026-07-22', '2026-07-29']);
  });

  it('start de herhaling correct als het bereik ná de eerste instantie begint', () => {
    const blokken = [{ id: 'a', titel: 'Partnertijd', datum: '2026-06-03', starttijd: '20:00', eindtijd: '21:00', herhaling: 'wekelijks' }];
    const instanties = instantiesInBereik(blokken, '2026-07-01', '2026-07-14');
    // 3 juni + n*7 dagen: 17 juni, 24 juni, 1 juli, 8 juli, ...
    expect(instanties.map((i) => i.datum)).toEqual(['2026-07-01', '2026-07-08']);
  });

  it('sorteert instanties chronologisch, ook over meerdere blokken heen', () => {
    const blokken = [
      { id: 'a', titel: 'Laat', datum: '2026-07-05', starttijd: '20:00', eindtijd: '21:00', herhaling: null },
      { id: 'b', titel: 'Vroeg', datum: '2026-07-05', starttijd: '08:00', eindtijd: '09:00', herhaling: null },
    ];
    const instanties = instantiesInBereik(blokken, '2026-07-01', '2026-07-31');
    expect(instanties.map((i) => i.titel)).toEqual(['Vroeg', 'Laat']);
  });
});

describe('heeftOverlap', () => {
  const blokken = [
    { id: 'a', titel: 'Bestaand', datum: '2026-07-15', starttijd: '18:00', eindtijd: '19:00', herhaling: null },
  ];

  it('detecteert een volledig overlappend kandidaat-blok', () => {
    expect(heeftOverlap(blokken, { datum: '2026-07-15', starttijd: '18:00', eindtijd: '19:00' })).toBe(true);
  });

  it('detecteert een gedeeltelijk overlappend kandidaat-blok', () => {
    expect(heeftOverlap(blokken, { datum: '2026-07-15', starttijd: '18:30', eindtijd: '19:30' })).toBe(true);
    expect(heeftOverlap(blokken, { datum: '2026-07-15', starttijd: '17:30', eindtijd: '18:30' })).toBe(true);
  });

  it('geeft false voor een aansluitend, niet-overlappend blok', () => {
    expect(heeftOverlap(blokken, { datum: '2026-07-15', starttijd: '19:00', eindtijd: '20:00' })).toBe(false);
    expect(heeftOverlap(blokken, { datum: '2026-07-15', starttijd: '17:00', eindtijd: '18:00' })).toBe(false);
  });

  it('geeft false voor een andere datum, ook al zijn de tijden gelijk', () => {
    expect(heeftOverlap(blokken, { datum: '2026-07-16', starttijd: '18:00', eindtijd: '19:00' })).toBe(false);
  });

  it('negeert het eigen blok bij het bewerken (negeerId)', () => {
    expect(heeftOverlap(blokken, { datum: '2026-07-15', starttijd: '18:00', eindtijd: '19:00' }, 'a')).toBe(false);
  });

  it('houdt rekening met herhalende blokken', () => {
    const herhalend = [
      { id: 'b', titel: 'Partnertijd', datum: '2026-07-01', starttijd: '20:00', eindtijd: '21:00', herhaling: 'wekelijks' },
    ];
    expect(heeftOverlap(herhalend, { datum: '2026-07-22', starttijd: '20:30', eindtijd: '21:30' })).toBe(true);
  });
});

describe('volgendeVrijeTijd', () => {
  it('geeft de gewenste tijd terug als die vrij is', () => {
    expect(volgendeVrijeTijd([], '2026-07-15', '10:00', 30)).toBe('10:00');
  });

  it('schuift door naar de eerstvolgende vrije tijd bij een bezette gewenste tijd', () => {
    const blokken = [{ id: 'a', titel: 'Bestaand', datum: '2026-07-15', starttijd: '10:00', eindtijd: '10:30', herhaling: null }];
    expect(volgendeVrijeTijd(blokken, '2026-07-15', '10:00', 30)).toBe('10:30');
  });

  it('blijft doorschuiven langs meerdere aaneengesloten bezette blokken', () => {
    const blokken = [
      { id: 'a', titel: 'Een', datum: '2026-07-15', starttijd: '10:00', eindtijd: '10:30', herhaling: null },
      { id: 'b', titel: 'Twee', datum: '2026-07-15', starttijd: '10:30', eindtijd: '11:00', herhaling: null },
    ];
    expect(volgendeVrijeTijd(blokken, '2026-07-15', '10:00', 30)).toBe('11:00');
  });

  it('houdt geen rekening met blokken op een andere datum', () => {
    const blokken = [{ id: 'a', titel: 'Bestaand', datum: '2026-07-16', starttijd: '10:00', eindtijd: '10:30', herhaling: null }];
    expect(volgendeVrijeTijd(blokken, '2026-07-15', '10:00', 30)).toBe('10:00');
  });
});
