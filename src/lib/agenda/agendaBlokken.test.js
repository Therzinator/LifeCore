import { describe, it, expect } from 'vitest';
import { instantiesInBereik } from './agendaBlokken.js';

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
