// Oefeningmateriaal gebaseerd op Free Exercise DB (yuhonas/free-exercise-db,
// public domain / Unlicense — https://github.com/yuhonas/free-exercise-db).
// Afbeeldingen zijn statisch (geen video/GIF), tekstuitleg is een eigen,
// korte Nederlandse samenvatting — geen letterlijke vertaling van de
// (langere, Engelstalige) FED-instructies, om aan te sluiten bij de rest
// van de stijl van de app (kort, direct).

import { OEFENINGEN_BIBLIOTHEEK } from '../training/schema.js';
import { vindFedAfbeelding } from './fedMatcher.js';

const FED_BASIS = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';

function fedAfbeelding(fedId) {
  return `${FED_BASIS}/${fedId}/0.jpg`;
}

// Handmatig gecontroleerde fedId's voor de bibliotheek-alternatieven en
// accessoire-oefeningen — geverifieerd tegen de Free Exercise DB-index i.p.v.
// blind op de automatische fuzzy-match (fedMatcher.js) te vertrouwen. Die
// fuzzy-match is de fallback voor oefeningen die HIER niet in staan (met
// name eigen/custom oefeningen die de gebruiker zelf toevoegt).
const BIBLIOTHEEK_OVERRIDES = {
  'front-squat': 'Front_Barbell_Squat',
  'goblet-squat': 'Goblet_Squat',
  'incline-bench': 'Smith_Machine_Incline_Bench_Press',
  'close-grip-bench': 'Close-Grip_Barbell_Bench_Press',
  // Pendlay Row heeft geen eigen entry in de FED — de dead-stop-variant van
  // de gewone barbell row, dus hergebruik van diezelfde afbeelding.
  'pendlay-row': 'Bent_Over_Barbell_Row',
  'push-press': 'Push_Press',
  'romanian-deadlift': 'Romanian_Deadlift',
  'sumo-deadlift': 'Sumo_Deadlift',
};

const EXTRA_OVERRIDES = {
  'floor-press': 'Dumbbell_Floor_Press',
  'chest-flye': 'Dumbbell_Flyes',
  'closegrip-fp': 'Close-Grip_Dumbbell_Press',
  // Diamond Push-ups staat niet in de FED — geen afbeelding, fedMatcher
  // vindt hier ook niets betrouwbaars voor.
  'chin-ups': 'Chin-Up',
  'inv-row': 'Inverted_Row',
  'db-row': 'One-Arm_Dumbbell_Row',
  'rear-delt': 'Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench',
  'bicep-curl': 'Barbell_Curl',
  'lat-raise': 'Side_Lateral_Raise',
  'front-raise': 'Front_Dumbbell_Raise',
  'arnold-press': 'Arnold_Dumbbell_Press',
  'skull-crusher': 'Lying_Close-Grip_Barbell_Triceps_Extension_Behind_The_Head',
  rdl: 'Romanian_Deadlift',
  'good-morning': 'Good_Morning',
  shrugs: 'Barbell_Shrug',
  superman: 'Superman',
};

function afbeeldingVoorOefening(id, naam, overrides) {
  const fedId = overrides[id];
  if (fedId) return fedAfbeelding(fedId);
  return vindFedAfbeelding(naam);
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

// Eén gedeelde vorm-opbouw voor elke oefening die niet tot de 5 kern-lifts
// behoort (LIFTCORE_OEFENINGEN heeft daarvoor al een rijke, handgeschreven
// Nederlandse uitleg — die wordt hier hergebruikt als hij bestaat). Voor de
// rest wordt een korte, eerlijke samenvatting opgebouwd uit spier/equip
// (die al Nederlands zijn in schema.js) i.p.v. te doen alsof er evenveel
// diepgang is als bij de kern-lifts.
function metAfbeelding(oef, overrides) {
  const curatie = LIFTCORE_OEFENINGEN[oef.id];
  if (curatie) {
    return { id: oef.id, naam: oef.naam, kort: curatie.kort, uitleg: curatie.uitleg, afbeelding: curatie.afbeelding, equipment: null };
  }
  return {
    id: oef.id,
    naam: oef.naam,
    kort: `Traint: ${oef.spier}`,
    uitleg: `Hoofdspiergroep: ${oef.spier}${oef.equip ? ` · Materiaal: ${oef.equip}` : ''}. Zie de afbeelding voor de uitvoering.`,
    afbeelding: afbeeldingVoorOefening(oef.id, oef.naam, overrides),
    equipment: oef.equip ?? null,
  };
}

// Alle bibliotheek-alternatieven (13, inclusief de 5 kern-lifts) — voor de
// bibliotheek-knop in LiftCore. Was voorheen beperkt tot de 5 kern-lifts.
export function volledigeBibliotheekLijst() {
  return OEFENINGEN_BIBLIOTHEEK.map((oef) => ({ ...metAfbeelding(oef, BIBLIOTHEEK_OVERRIDES), categorie: oef.categorie }));
}

// Eén EXTRA-accessoire-oefening (uit lib/training/schema.js) verrijkt met
// afbeelding/kort/uitleg, in de vorm die OefeningPopup/OefeningDetail
// verwachten — gebruikt door TrainingExtra.jsx om per item een popup te tonen.
export function extraOefeningMetAfbeelding(oef) {
  return metAfbeelding(oef, EXTRA_OVERRIDES);
}
