// Oefeningmateriaal gebaseerd op Free Exercise DB (yuhonas/free-exercise-db,
// public domain / Unlicense — https://github.com/yuhonas/free-exercise-db).
// Afbeeldingen zijn statisch (geen video/GIF), tekstuitleg is een eigen,
// korte Nederlandse samenvatting — geen letterlijke vertaling van de
// (langere, Engelstalige) FED-instructies, om aan te sluiten bij de rest
// van de stijl van de app (kort, direct).

import { SCHEMA } from '../training/schema.js';

const FED_BASIS = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';

function fedAfbeelding(fedId) {
  return `${FED_BASIS}/${fedId}/0.jpg`;
}

// StrongLifts 5×5-basisoefeningen — koppelt aan de id's uit lib/training/schema.js.
export const LIFTCORE_OEFENINGEN = {
  squat: {
    fedId: 'Barbell_Squat',
    afbeelding: fedAfbeelding('Barbell_Squat'),
    kort: 'Stang op de bovenrug, zak door heup en knie tot net onder evenwicht, duw terug omhoog.',
    uitleg:
      'Stang iets onder schouderhoogte in het rek, stap eronder en laat hem op je bovenrug rusten. ' +
      'Stap achteruit met voeten op heupbreedte, tenen licht naar buiten. Zak door je heupen en knieën ' +
      'tot je bovenbenen net onder horizontaal zijn — knieën blijven ongeveer boven je voeten, rug recht. ' +
      'Duw door je hielen terug omhoog naar de startpositie.',
  },
  bench: {
    fedId: 'Barbell_Bench_Press_-_Medium_Grip',
    afbeelding: fedAfbeelding('Barbell_Bench_Press_-_Medium_Grip'),
    kort: 'Lig op de bank, stang naar je borst, druk terug omhoog met gesloten schouderbladen.',
    uitleg:
      'Lig op je rug op de bank, grip iets breder dan schouderbreedte. Til de stang uit het rek en houd hem ' +
      'recht boven je borst. Laat hem gecontroleerd zakken tot je borst geraakt wordt, druk daarna terug ' +
      'omhoog tot je armen gestrekt zijn. Houd je schouderbladen samengetrokken gedurende de hele beweging.',
  },
  row: {
    fedId: 'Bent_Over_Barbell_Row',
    afbeelding: fedAfbeelding('Bent_Over_Barbell_Row'),
    kort: 'Buig voorover met rechte rug, trek de stang naar je buik, laat gecontroleerd zakken.',
    uitleg:
      'Sta met de stang voor je, buig licht door de knieën en buig voorover vanuit de heup tot je torso ' +
      'bijna horizontaal is — rug recht, hoofd in lijn met de rug. Trek de stang naar je onderbuik, ' +
      'ellebogen dicht bij het lichaam, knijp je schouderbladen samen boven. Laat daarna gecontroleerd zakken.',
  },
  ohp: {
    fedId: 'Barbell_Shoulder_Press',
    afbeelding: fedAfbeelding('Barbell_Shoulder_Press'),
    kort: 'Stang op schouderhoogte, druk recht omhoog tot de armen gestrekt zijn.',
    uitleg:
      'Houd de stang op schouderhoogte met een grip iets breder dan schouderbreedte, ellebogen onder de ' +
      'polsen. Druk de stang recht omhoog tot je armen volledig gestrekt zijn, zonder je rug hol te trekken. ' +
      'Laat gecontroleerd terug zakken naar schouderhoogte.',
  },
  deadlift: {
    fedId: 'Barbell_Deadlift',
    afbeelding: fedAfbeelding('Barbell_Deadlift'),
    kort: 'Stang vlak voor de schenen, til met rechte rug door je benen te strekken.',
    uitleg:
      'Sta met de stang vlak voor je schenen, voeten op heupbreedte. Buig door je heupen en knieën en pak ' +
      'de stang beet met een grip net buiten je benen. Til de stang op door je benen te strekken en je ' +
      'torso tegelijk rechtop te brengen — rug blijft recht, stang blijft dicht bij het lichaam. Zet de ' +
      'stang gecontroleerd weer neer.',
  },
};

// Nek/schouder/borst-opening-oefeningen tegen stress-spanning en het
// 'klem komen te zitten'-gevoel — de kernset (2) wordt direct in de
// ochtendroutine getoond, de volledige set is ook browsable via de
// oefeningenbibliotheek en als aparte categorie in Training → Extra.
export const SPANNING_OEFENINGEN = [
  {
    id: 'kin-naar-borst',
    fedId: 'Chin_To_Chest_Stretch',
    naam: 'Kin naar borst',
    categorie: 'nek',
    equipment: null,
    kern: true,
    afbeelding: fedAfbeelding('Chin_To_Chest_Stretch'),
    kort: 'Handen achter het hoofd, kin langzaam naar je borst. 20-30s vasthouden.',
    uitleg:
      'Zit rechtop. Vouw je handen achter je hoofd, vingers verstrengeld. Trek je hoofd langzaam naar ' +
      'beneden richting je borst tot je een rek voelt in je nek. Niet forceren — laat het gewicht van je ' +
      'armen het werk doen. Hou 20-30 seconden vast, adem rustig door.',
  },
  {
    id: 'borst-opening-dynamisch',
    fedId: 'Dynamic_Chest_Stretch',
    naam: 'Borst openen (dynamisch)',
    categorie: 'borst',
    equipment: null,
    kern: true,
    afbeelding: fedAfbeelding('Dynamic_Chest_Stretch'),
    kort: 'Armen gestrekt voor je, zwaai ze naar achteren en weer terug. 5-10×.',
    uitleg:
      'Sta rechtop, armen gestrekt voor je met de handen tegen elkaar. Zwaai je armen zo ver mogelijk naar ' +
      'achteren — alsof je je borst opent — en weer terug naar voren, als een overdreven klapbeweging. ' +
      'Herhaal 5-10 keer, bouw rustig op in snelheid.',
  },
  {
    id: 'kat-stretch',
    fedId: 'Cat_Stretch',
    naam: 'Kat-stretch',
    categorie: 'rug',
    equipment: null,
    kern: false,
    afbeelding: fedAfbeelding('Cat_Stretch'),
    kort: 'Op handen en knieën, rug bol maken, hoofd laten hangen. 15s vasthouden.',
    uitleg:
      'Kom op handen en knieën. Trek je buik in en maak je rug bol — bovenrug, onderrug, schouders en nek ' +
      'volgen, laat je hoofd los hangen. Hou 15 seconden vast en adem rustig door.',
  },
  {
    id: 'nek-zelfmassage',
    fedId: 'Neck-SMR',
    naam: 'Nek-zelfmassage (roller)',
    categorie: 'nek',
    equipment: 'massage-roller of deegroller',
    kern: false,
    afbeelding: fedAfbeelding('Neck-SMR'),
    kort: 'Roller achter je nek, langzaam afrollen, pauzeer bij spanningspunten.',
    uitleg:
      'Plaats een massageroller (of deegroller) achter je hoofd, tegen je nek — net naast de wervelkolom, ' +
      'niet erop. Rol langzaam vanaf je nek naar beneden, en pauzeer 10-30 seconden bij plekken die extra ' +
      'gespannen aanvoelen.',
  },
  {
    id: 'borst-en-schouder-stretch',
    fedId: 'Chest_And_Front_Of_Shoulder_Stretch',
    naam: 'Borst & voorste schouder (stok)',
    categorie: 'borst',
    equipment: 'bezemsteel of stok',
    kern: false,
    afbeelding: fedAfbeelding('Chest_And_Front_Of_Shoulder_Stretch'),
    kort: 'Stok iets breder dan schouderbreedte vasthouden, voorzichtig over het hoofd naar achteren tillen.',
    uitleg:
      'Sta rechtop, benen bij elkaar, en houd een bezemsteel of stok vast met een grip iets breder dan ' +
      'schouderbreedte, handpalmen naar beneden. Til de stok voorzichtig over je hoofd naar achteren tot ' +
      'je een rek voelt in borst en voorste schouders. Niet forceren.',
  },
];

export function spanningOefeningKernSet() {
  return SPANNING_OEFENINGEN.filter((o) => o.kern);
}

// Combineert de StrongLifts-basisoefeningen (naam uit schema.js) met de
// FED-afbeelding/uitleg hierboven, in de vorm die OefeningenBibliotheek
// verwacht — voor de bibliotheek-knop in LiftCore.
export function liftcoreBibliotheekLijst() {
  const uniek = new Map();
  [...SCHEMA.A, ...SCHEMA.B].forEach((oef) => {
    if (uniek.has(oef.id)) return;
    const metadata = LIFTCORE_OEFENINGEN[oef.id];
    if (!metadata) return;
    uniek.set(oef.id, {
      id: oef.id,
      naam: oef.naam,
      categorie: 'basis',
      kort: metadata.kort,
      uitleg: metadata.uitleg,
      afbeelding: metadata.afbeelding,
      equipment: null,
    });
  });
  return Array.from(uniek.values());
}
