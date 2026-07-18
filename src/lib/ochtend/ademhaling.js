import { maakFaseCyclus } from '../gedeeld/faseCyclus.js';

export const FASES = [
  { naam: 'inademen', duur: 4 },
  { naam: 'vasthouden', duur: 4 },
  { naam: 'uitademen', duur: 6 },
];

const { cyclusDuur, faseOpTijdstip } = maakFaseCyclus(FASES);

export { cyclusDuur, faseOpTijdstip };

export function totaleDuur(aantalCycli) {
  return cyclusDuur() * aantalCycli;
}
