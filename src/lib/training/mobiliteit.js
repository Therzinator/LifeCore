// Dynamische mobiliteit-oefeningen voor de warming-up in Training — één
// oefening per gebied dat de warming-up-detailregel al noemt (heupen,
// schouders, wervelkolom, enkels), plus een samengestelde heup-oefening.
// Zelfde vorm/bron als SPANNING_OEFENINGEN in vrijeOefeningenDb.js: een
// korte, eigen Nederlandse samenvatting per oefening + start-/eindafbeelding
// uit de Free Exercise DB (public domain).
import { fedAfbeeldingenVoorId } from '../oefeningen/fedMatcher.js';

const FED_BASIS = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';

function fedAfbeelding(fedId) {
  return `${FED_BASIS}/${fedId}/0.jpg`;
}

const MOBILITEIT_OEFENINGEN_RUW = [
  {
    id: 'enkel-cirkels',
    fedId: 'Ankle_Circles',
    naam: 'Enkel-cirkels',
    categorie: 'enkels',
    afbeelding: fedAfbeelding('Ankle_Circles'),
    kort: '10× ronddraaien per richting, per enkel.',
    uitleg:
      'Sta op één been (steun evt. tegen een muur) of zit met het been los. Draai de andere voet vanuit de ' +
      'enkel 10× rond in één richting, dan 10× de andere kant op. Wissel van been.',
  },
  {
    id: 'staande-heup-cirkels',
    fedId: 'Standing_Hip_Circles',
    naam: 'Staande heup-cirkels',
    categorie: 'heupen',
    afbeelding: fedAfbeelding('Standing_Hip_Circles'),
    kort: 'Handen in de zij, grote cirkels met de heup — 8× per richting.',
    uitleg:
      'Sta rechtop, handen in de zij, voeten op heupbreedte. Maak grote, langzame cirkels met je heupen — ' +
      '8× met de klok mee, 8× tegen de klok in. Houd de rest van je lichaam zo stil mogelijk.',
  },
  {
    id: 'lunge-pass-through',
    fedId: 'Lunge_Pass_Through',
    naam: 'Lunge met rotatie',
    categorie: 'heupen',
    afbeelding: fedAfbeelding('Lunge_Pass_Through'),
    kort: 'Grote stap voorwaarts, draai de romp naar het voorste been. 5× per kant.',
    uitleg:
      'Zet een grote stap naar voren in een lunge. Draai vanuit je romp naar de kant van het voorste been, ' +
      'kom terug naar het midden, stap terug bij. 5× per been — opent heup en wervelkolom tegelijk.',
  },
  {
    id: 'romp-rotatie',
    fedId: 'Torso_Rotation',
    naam: 'Romp-rotatie',
    categorie: 'wervelkolom',
    afbeelding: fedAfbeelding('Torso_Rotation'),
    kort: 'Staand, armen los, draai de romp heen en weer. 10× per kant.',
    uitleg:
      'Sta rechtop, voeten op heupbreedte, armen ontspannen. Draai je romp rustig naar links en rechts, ' +
      'laat de armen meezwaaien. 10× per kant, rustig tempo — geen ruk-beweging.',
  },
  {
    id: 'arm-cirkels',
    fedId: 'Arm_Circles',
    naam: 'Arm-cirkels',
    categorie: 'schouders',
    afbeelding: fedAfbeelding('Arm_Circles'),
    kort: 'Armen gestrekt opzij, cirkels maken — 10× per richting.',
    uitleg:
      'Sta rechtop, strek beide armen opzij op schouderhoogte. Maak kleine, dan geleidelijk grotere cirkels — ' +
      '10× naar voren, 10× naar achteren.',
  },
];

export const MOBILITEIT_OEFENINGEN = MOBILITEIT_OEFENINGEN_RUW.map((o) => ({
  ...o,
  afbeeldingen: fedAfbeeldingenVoorId(o.fedId),
}));
