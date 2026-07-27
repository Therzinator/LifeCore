import { useVragenlijstGeschiedenis } from './useVragenlijstGeschiedenis.js';
import { useTrainingGeschiedenis } from './useTrainingGeschiedenis.js';
import { useWerkTaken } from './useWerkTaken.js';
import { useEigenBedrijfInstellingen } from './useEigenBedrijfInstellingen.js';
import { useEigenBedrijfSessies } from './useEigenBedrijfSessies.js';
import {
  koppeling2_welzijnNaarWaarden,
  koppeling3_welzijnNaarFocus,
  koppeling4_trainingNaarOchtend,
  koppeling5_werkNaarWelzijn,
  koppeling6_eigenBedrijfOverschrijding,
  afgerondeTakenPerWeek,
} from '../lib/signalen/kruisverbanden.js';

// Dunne hook: leest de bron-geschiedenissen van andere modules en voedt ze
// aan de pure koppeling-functies. Elke consumer geeft alleen de toggle(s)
// door die het zelf nodig heeft (uit zijn eigen instellingen-hook) — geen
// module hoeft instellingen van een andere module rechtstreeks te lezen.
// Koppeling 6 is een uitzondering: bron én doel zijn Eigen bedrijf zelf,
// dus die toggle (signaalActief) wordt hier rechtstreeks uit
// useEigenBedrijfInstellingen gelezen i.p.v. als los argument doorgegeven.
export function useKruisSignalen({ waarden, focus, ochtend, welzijnVroegCheck } = {}) {
  const welzijnGeschiedenis = useVragenlijstGeschiedenis('welzijn_check');
  const trainingGeschiedenis = useTrainingGeschiedenis();
  const werkTaken = useWerkTaken();
  const { instellingen: eigenBedrijfInstellingen } = useEigenBedrijfInstellingen();
  const eigenBedrijfSessies = useEigenBedrijfSessies();

  const signalen = [
    koppeling2_welzijnNaarWaarden(welzijnGeschiedenis.afnames, waarden),
    koppeling4_trainingNaarOchtend(trainingGeschiedenis.laatste?.datum, ochtend),
    koppeling5_werkNaarWelzijn(afgerondeTakenPerWeek(werkTaken.alleTaken), welzijnVroegCheck),
    koppeling6_eigenBedrijfOverschrijding(
      eigenBedrijfSessies.sessies,
      eigenBedrijfInstellingen.blokken,
      { wekenOpRij: eigenBedrijfInstellingen.signaalWekenOpRij, pctBovenSchema: eigenBedrijfInstellingen.signaalPctBovenSchema },
      eigenBedrijfInstellingen.signaalActief,
    ),
  ].filter(Boolean);

  const focusMoetVerlagen = koppeling3_welzijnNaarFocus(welzijnGeschiedenis.afnames, focus);

  return { signalen, focusMoetVerlagen };
}
