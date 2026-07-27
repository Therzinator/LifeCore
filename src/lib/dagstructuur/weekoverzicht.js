import { dagIndexVan, maandagVan, datumKey } from '../../utils/datum.js';
import { CARDIO_ACTIVITEITEN } from '../cardio/checklist.js';
import { blokkenVoorDagIndex } from '../eigenbedrijf/blokken.js';

const DAG_LABELS = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];

// Vaste liftdagen (StrongLifts 3×/week) + de niet-liftdagen als aanbevolen
// cardio-slot — symmetrisch met training, maar zonder een harde
// verplichting: 'aanbevolen' is een suggestie, geen eis (net als de rest
// van de cardio-module, die bewust geen afstand/tijd-doelen afdwingt).
// Zondag blijft een vrije rustdag.
export const LIFT_DAGEN = [0, 2, 4]; // ma, wo, vr
export const CARDIO_DAGEN = [1, 3, 5]; // di, do, za

function isCardioGedaanOp(cardioDagenRecord, datumIso) {
  const activiteiten = cardioDagenRecord[datumIso];
  if (!activiteiten) return false;
  return CARDIO_ACTIVITEITEN.some((a) => activiteiten[a.id]);
}

// Combineert training-liftdagen en cardio-activiteit tot één 7-daags
// overzicht van de huidige week (maandag t/m zondag). eigenBedrijfBlokken
// is additief — het overschrijft nooit het lift/cardio/rust-type van een
// dag (di/do/za zijn al cardio-dagen), maar levert een los 'eigenBedrijf'-
// veld op zodat de UI er een eigen merkje bovenop kan tonen. De default []
// houdt bestaande aanroepers (en tests/weekoverzicht.test.js) ongewijzigd.
export function bepaalWeekoverzicht(trainingSessies, cardioDagenRecord, eigenBedrijfBlokken = []) {
  const vandaagIso = new Date().toISOString();
  const vandaagIndex = dagIndexVan(vandaagIso);
  const dezeMaandag = maandagVan(vandaagIso);

  const liftGedaan = new Set(
    trainingSessies
      .filter((s) => maandagVan(s.datum) === dezeMaandag)
      .map((s) => dagIndexVan(s.datum)),
  );

  const cardioGedaan = new Set(
    Object.keys(cardioDagenRecord)
      .filter((datum) => maandagVan(datum) === dezeMaandag && isCardioGedaanOp(cardioDagenRecord, datum))
      .map((datum) => dagIndexVan(datum)),
  );

  return DAG_LABELS.map((label, i) => {
    const type = LIFT_DAGEN.includes(i) ? 'lift' : CARDIO_DAGEN.includes(i) ? 'cardio' : 'rust';
    const gedaan = type === 'lift' ? liftGedaan.has(i) : type === 'cardio' ? cardioGedaan.has(i) : null;
    const dagDatum = new Date(dezeMaandag);
    dagDatum.setDate(dagDatum.getDate() + i);
    const eigenBedrijf = blokkenVoorDagIndex(eigenBedrijfBlokken, i);
    return {
      label, type, gedaan, vandaag: i === vandaagIndex, datum: datumKey(dagDatum), eigenBedrijf,
    };
  });
}
