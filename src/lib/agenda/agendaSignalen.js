import { LIFT_DAGEN, CARDIO_DAGEN } from '../dagstructuur/weekoverzicht.js';
import { dagIndexVan } from '../../utils/datum.js';
import { volgendeCheckDatum } from '../welzijn/vragenset.js';

// Alle losse signalen die de Agenda toont zijn afgeleide, pure functies over
// bestaande module-data (zelfde principe als de kruismodule-signalenlaag,
// zie docs/SIGNALEN.md) — geen nieuwe opslag, behalve de losse
// agenda_blokken die de gebruiker zelf aanmaakt (zie useAgendaBlokken.js).
// Elk signaal krijgt een 'datum' zodat de UI ze uniform kan sorteren/tonen,
// ook signalen die eigenlijk maand-granulariteit hebben (bv. project-
// klusjes) — die worden verankerd op de 1e van hun maand.

function alleDatumsInBereik(bereikStart, bereikEind) {
  const datums = [];
  const cursor = new Date(bereikStart);
  const eind = new Date(bereikEind);
  while (cursor <= eind) {
    datums.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 1);
  }
  return datums;
}

// Liftdagen/aanbevolen cardiodagen — hergebruikt patroon uit
// lib/dagstructuur/weekoverzicht.js (WeekOverzicht-widget), maar dan voor
// een willekeurig bereik i.p.v. alleen 'deze week'.
export function trainingCardioSignalen(bereikStart, bereikEind) {
  return alleDatumsInBereik(bereikStart, bereikEind)
    .map((datum) => {
      const dagIndex = dagIndexVan(datum);
      if (LIFT_DAGEN.includes(dagIndex)) return { id: `training_${datum}`, bron: 'training', datum, tekst: 'Liftdag', type: 'lift' };
      if (CARDIO_DAGEN.includes(dagIndex)) return { id: `cardio_${datum}`, bron: 'cardio', datum, tekst: 'Cardio (aanbevolen)', type: 'cardio' };
      return null;
    })
    .filter(Boolean);
}

// werkdagen komt uit useWerkInstellingen: ISO-weekdagnummers 1(ma)-7(zo).
export function werkdagSignalen(bereikStart, bereikEind, werkdagen) {
  if (!werkdagen?.length) return [];
  return alleDatumsInBereik(bereikStart, bereikEind)
    .filter((datum) => werkdagen.includes(dagIndexVan(datum) + 1))
    .map((datum) => ({ id: `werk_${datum}`, bron: 'werk', datum, tekst: 'Werkdag', type: 'werkdag' }));
}

export function welzijnSignaal(laatsteCheckDatum, cadansDagen) {
  const volgende = volgendeCheckDatum(laatsteCheckDatum, cadansDagen);
  if (!volgende) return null;
  return {
    id: 'welzijn_check', bron: 'welzijn', datum: volgende.toISOString().slice(0, 10),
    tekst: 'Burn-out & herstel-check', type: 'welzijn',
  };
}

// Open (niet-afgeronde) Huishoud-projectklusjes gepland binnen het bereik —
// verankerd op de 1e van hun toegewezen maand, want de Projecten-verdeling
// kent geen specifieke dag, alleen een maand.
export function huishoudProjectSignalen(projecten, bereikStart, bereikEind) {
  const bereikStartMaand = bereikStart.slice(0, 7);
  const bereikEindMaand = bereikEind.slice(0, 7);
  const signalen = [];
  (projecten ?? []).forEach((project) => {
    project.klusjes.forEach((klusje) => {
      if (klusje.afgerond) return;
      if (klusje.maand < bereikStartMaand || klusje.maand > bereikEindMaand) return;
      signalen.push({
        id: `project_${klusje.id}`, bron: 'huishouden', datum: `${klusje.maand}-01`,
        tekst: `${project.naam}: ${klusje.tekst}`, type: 'project',
      });
    });
  });
  return signalen;
}
