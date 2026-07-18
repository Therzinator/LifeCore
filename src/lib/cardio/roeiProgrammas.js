// Roeimachine als cardio-alternatief voor hardlopen — zelfde aerobe/anaerobe
// prikkel, zonder impactbelasting op knieën/enkels. Bruikbaar op rustdagen
// of als het weer buiten sporten in de weg zit.
export const ROEI_PROGRAMMAS = {
  basis: {
    titel: 'Basis cardioroeien — 20 min',
    omschrijving: 'Goed alternatief voor een makkelijke loopdag. Lage hartslag, techniek staat centraal.',
    stappen: [
      { fase: 'Warming-up', duur: 5, uitleg: 'Roeien op lage weerstand (3-4). Rustig tempo, focus op techniek: duw eerst met de benen, dan lean back, dan armen.' },
      { fase: 'Hoofdblok', duur: 12, uitleg: 'Verhoog naar weerstand 5-6. Streef naar 22-24 slagen/min. Hartslagzone 2 (60-70% max).' },
      { fase: 'Cooling-down', duur: 3, uitleg: 'Verlaag weerstand, vertraag slagritme tot 18/min. Rustig uitroeien.' },
    ],
  },
  duur: {
    titel: 'Duurtraining — 35 min',
    omschrijving: 'Vervangt een middellange looprun. Goede aerobe basis, laag blessurerisico.',
    stappen: [
      { fase: 'Warming-up', duur: 8, uitleg: 'Weerstand 3-4, opbouwend naar 5. 20 slagen/min opbouwend naar 22.' },
      { fase: 'Duurblok 1', duur: 10, uitleg: 'Weerstand 5-6. Stabiel tempo, 22-24 slagen/min. Zone 2 hartslag.' },
      { fase: 'Rustblok', duur: 2, uitleg: 'Verlagen naar weerstand 3, herstel hartslag.' },
      { fase: 'Duurblok 2', duur: 10, uitleg: 'Zelfde intensiteit als blok 1.' },
      { fase: 'Cooling-down', duur: 5, uitleg: 'Weerstand naar beneden, 18-20 slagen/min.' },
    ],
  },
  interval: {
    titel: 'Intervaltraining — 25 min',
    omschrijving: 'Equivalent van een hardloopinterval. Verhoogt de lactaatdrempel.',
    stappen: [
      { fase: 'Warming-up', duur: 7, uitleg: 'Weerstand 4-5, opbouwen naar comfortabel tempo (20-22 slagen/min).' },
      { fase: 'Interval 1', duur: 2, uitleg: 'Hard roeien — weerstand 7-8, 26-28 slagen/min.' },
      { fase: 'Herstel', duur: 2, uitleg: 'Weerstand 2, langzaam roeien.' },
      { fase: 'Interval 2', duur: 2, uitleg: 'Hard — zelfde als interval 1.' },
      { fase: 'Herstel', duur: 2, uitleg: 'Weerstand 2, rustig.' },
      { fase: 'Interval 3', duur: 2, uitleg: 'Laatste sprint.' },
      { fase: 'Cooling-down', duur: 6, uitleg: 'Weerstand 2-3, langzaam terugkomen. Strek armen en benen.' },
    ],
  },
};

export function totaleDuur(programma) {
  return programma.stappen.reduce((som, stap) => som + stap.duur, 0);
}

// HIIT is de enige variant die niet vast is: werk/rust-verhouding en aantal
// rondes komen uit de Cardio-instellingen, dus het programma wordt bij elke
// weergave opnieuw opgebouwd in plaats van als vaste preset opgeslagen.
export function bouwHiitProgramma(werkSec, rustSec, rondes) {
  const stappen = [
    { fase: 'Warming-up', duur: 5, uitleg: 'Weerstand 3-4, opbouwend tempo. Bereidt de spieren voor op korte, harde intervallen.' },
  ];
  for (let r = 1; r <= rondes; r++) {
    stappen.push({ fase: `Interval ${r}`, duur: werkSec / 60, uitleg: 'Maximale inspanning — weerstand 8-10, zo hoog mogelijk slagtempo.' });
    if (r < rondes) {
      stappen.push({ fase: 'Herstel', duur: rustSec / 60, uitleg: 'Weerstand 2, langzaam doorroeien of stilzitten.' });
    }
  }
  stappen.push({ fase: 'Cooling-down', duur: 5, uitleg: 'Weerstand 2-3, rustig uitroeien.' });

  return {
    titel: `HIIT-roeien — ${werkSec}s werk / ${rustSec}s rust × ${rondes}`,
    omschrijving: 'Korte, maximale intervallen met korte hersteltijd — de grootste VO2max-prikkel van de vier varianten.',
    stappen,
  };
}
