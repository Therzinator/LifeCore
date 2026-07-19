import { useVragenlijstGeschiedenis } from './useVragenlijstGeschiedenis.js';
import { kompasScores } from '../lib/act/kompas.js';

// Hergebruikt useVragenlijstGeschiedenis (al gebruikt door de welzijn-check)
// i.p.v. een eigen opslagpatroon — het kompas is qua vorm hetzelfde: een
// periodieke invulling met antwoorden + afgeleide scores, bewaard als reeks.
export function useWaardenkompas() {
  const geschiedenis = useVragenlijstGeschiedenis('waarden_kompas');

  function nieuweInvulling(antwoorden) {
    geschiedenis.voegToe(antwoorden, kompasScores(antwoorden));
  }

  return { ...geschiedenis, nieuweInvulling };
}
