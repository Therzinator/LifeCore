import { useHuishoudProjecten } from './useHuishoudProjecten.js';
import { useWelzijnInstellingen } from './useWelzijnInstellingen.js';
import { useVragenlijstGeschiedenis } from './useVragenlijstGeschiedenis.js';
import { useWerkInstellingen } from './useWerkInstellingen.js';
import {
  trainingCardioSignalen, werkdagSignalen, welzijnSignaal, huishoudProjectSignalen, klusjesDagSignalen,
} from '../lib/agenda/agendaSignalen.js';

// Dunne hook, zelfde opzet als useKruisSignalen: leest de bron-hooks van
// andere modules uit en voedt ze aan de pure signaal-functies. Geeft één
// platte, met datum gesorteerde lijst terug voor een gegeven bereik.
//
// dagTypeOverrides wordt als parameter meegegeven i.p.v. hier zelf
// useDagTypeOverrides() aan te roepen — AgendaPagina heeft zelf ook een
// instantie nodig (om overrides te kunnen zetten), en twee losse hook-
// instanties van dezelfde useState-gebaseerde hook synchroniseren niet met
// elkaar: de schrijvende instantie zou hier niet in gereflecteerd worden.
export function useAgendaSignalen(bereikStart, bereikEind, dagTypeOverrides = {}, huishoudenId = null) {
  const huishoudProjecten = useHuishoudProjecten(huishoudenId);
  const { instellingen: welzijnInstellingen } = useWelzijnInstellingen();
  const welzijnGeschiedenis = useVragenlijstGeschiedenis('welzijn_check');
  const { instellingen: werkInstellingen } = useWerkInstellingen();

  const signalen = [
    ...trainingCardioSignalen(bereikStart, bereikEind),
    ...werkdagSignalen(bereikStart, bereikEind, werkInstellingen.werkdagen, dagTypeOverrides),
    ...klusjesDagSignalen(bereikStart, bereikEind, werkInstellingen.klusjesDag, dagTypeOverrides),
    ...huishoudProjectSignalen(huishoudProjecten.projecten, bereikStart, bereikEind),
    welzijnSignaal(welzijnGeschiedenis.laatste?.datum, welzijnInstellingen.cadansDagen),
  ].filter((s) => s && s.datum >= bereikStart && s.datum <= bereikEind)
    .sort((a, b) => a.datum.localeCompare(b.datum));

  return { signalen };
}
