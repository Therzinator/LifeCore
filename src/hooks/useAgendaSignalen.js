import { useWelzijnInstellingen } from './useWelzijnInstellingen.js';
import { useVragenlijstGeschiedenis } from './useVragenlijstGeschiedenis.js';
import { useWerkInstellingen } from './useWerkInstellingen.js';
import { useTrainingInstellingen } from './useTrainingInstellingen.js';
import {
  trainingCardioSignalen, werkdagSignalen, welzijnSignaal, huishoudProjectSignalen, klusjesDagSignalen,
} from '../lib/agenda/agendaSignalen.js';

// Dunne hook, zelfde opzet als useKruisSignalen: leest de bron-hooks van
// andere modules uit en voedt ze aan de pure signaal-functies. Geeft één
// platte, met datum gesorteerde lijst terug voor een gegeven bereik.
//
// dagTypeOverrides én huishoudProjecten worden als parameter meegegeven
// i.p.v. hier zelf useDagTypeOverrides()/useHuishoudProjecten() aan te
// roepen — AgendaPagina heeft zelf ook een instantie van allebei nodig
// (om overrides te zetten resp. voor de Klusjes-dag-suggesties), en twee
// losse instanties van useHuishoudProjecten voor hetzelfde huishouden
// botsten op hetzelfde Supabase Realtime-kanaal (zie kluslijstGedeeld.js)
// en crashten de hele Agenda-pagina. Eén gedeelde instantie, hier alleen
// als data doorgegeven.
export function useAgendaSignalen(bereikStart, bereikEind, dagTypeOverrides = {}, huishoudProjecten = []) {
  const { instellingen: welzijnInstellingen } = useWelzijnInstellingen();
  const welzijnGeschiedenis = useVragenlijstGeschiedenis('welzijn_check');
  const { instellingen: werkInstellingen } = useWerkInstellingen();
  const { instellingen: trainingInstellingen } = useTrainingInstellingen();

  const voorkeurTijden = {
    ochtend: trainingInstellingen.voorkeurTijdOchtend,
    middag: trainingInstellingen.voorkeurTijdMiddag,
    avond: trainingInstellingen.voorkeurTijdAvond,
  };

  const signalen = [
    ...trainingCardioSignalen(bereikStart, bereikEind, voorkeurTijden),
    ...werkdagSignalen(bereikStart, bereikEind, werkInstellingen.werkdagen, dagTypeOverrides),
    ...klusjesDagSignalen(bereikStart, bereikEind, werkInstellingen.klusjesDag, dagTypeOverrides),
    ...huishoudProjectSignalen(huishoudProjecten, bereikStart, bereikEind),
    welzijnSignaal(welzijnGeschiedenis.laatste?.datum, welzijnInstellingen.cadansDagen),
  ].filter((s) => s && s.datum >= bereikStart && s.datum <= bereikEind)
    .sort((a, b) => a.datum.localeCompare(b.datum));

  return { signalen };
}
