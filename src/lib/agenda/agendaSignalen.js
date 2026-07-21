import { LIFT_DAGEN, CARDIO_DAGEN } from '../dagstructuur/weekoverzicht.js';
import { dagIndexVan, datumKey } from '../../utils/datum.js';
import { volgendeCheckDatum } from '../welzijn/vragenset.js';
import { huidigePeriodeKey } from '../werk/huishoudPeriode.js';

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
    datums.push(datumKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return datums;
}

const STANDAARD_VOORKEUR_TIJDEN = { ochtend: '07:40', middag: '16:00', avond: '20:00' };

// Liftdagen/aanbevolen cardiodagen — hergebruikt patroon uit
// lib/dagstructuur/weekoverzicht.js (WeekOverzicht-widget), maar dan voor
// een willekeurig bereik i.p.v. alleen 'deze week'. Elk signaal krijgt
// tijdOpties (ochtend/middag/avond, uit Training-instellingen) zodat de
// Agenda-dagweergave meteen een 'als blok inplannen'-keuze kan tonen i.p.v.
// alleen een tekst-label — het liefst vroeg in de ochtend (dicht bij het
// ontbijt), met een alternatief later op de dag voor als dat niet lukt.
export function trainingCardioSignalen(bereikStart, bereikEind, voorkeurTijden = STANDAARD_VOORKEUR_TIJDEN) {
  const tijdOpties = [
    { label: 'Ochtend', starttijd: voorkeurTijden.ochtend },
    { label: 'Middag', starttijd: voorkeurTijden.middag },
    { label: 'Avond', starttijd: voorkeurTijden.avond },
  ];

  return alleDatumsInBereik(bereikStart, bereikEind)
    .map((datum) => {
      const dagIndex = dagIndexVan(datum);
      if (LIFT_DAGEN.includes(dagIndex)) {
        return { id: `training_${datum}`, bron: 'training', datum, tekst: 'Liftdag', type: 'lift', tijdOpties };
      }
      if (CARDIO_DAGEN.includes(dagIndex)) {
        return { id: `cardio_${datum}`, bron: 'cardio', datum, tekst: 'Cardio (aanbevolen)', type: 'cardio', tijdOpties };
      }
      return null;
    })
    .filter(Boolean);
}

// werkdagen komt uit useWerkInstellingen: ISO-weekdagnummers 1(ma)-7(zo).
// overrides (useDagTypeOverrides) wint per specifieke datum van het vaste
// wekelijkse patroon — voor de uitzondering (een zaterdag die toch werkdag
// is, of een doordeweekse dag die vrij is) zonder het hele patroon te
// hoeven aanpassen.
export function werkdagSignalen(bereikStart, bereikEind, werkdagen, overrides = {}) {
  const patroon = werkdagen ?? [];
  return alleDatumsInBereik(bereikStart, bereikEind)
    .map((datum) => {
      const override = overrides[datum];
      if (override === 'vrij') {
        return { id: `vrij_${datum}`, bron: 'werk', datum, tekst: 'Vrije dag (handmatig ingesteld)', type: 'vrij' };
      }
      const isWerkdag = override === 'werkdag' || (!override && patroon.includes(dagIndexVan(datum) + 1));
      if (!isWerkdag) return null;
      return {
        id: `werk_${datum}`, bron: 'werk', datum,
        tekst: override === 'werkdag' ? 'Werkdag (handmatig ingesteld)' : 'Werkdag',
        type: 'werkdag',
      };
    })
    .filter(Boolean);
}

// Vaste, terugkerende Klusjes-dag (ingesteld bij Werk-instellingen) — zelfde
// patroon als werkdagSignalen: het vaste patroon geldt tenzij een specifieke
// datum een override heeft (via AgendaDag, gedeelde overrides-store). Een
// dag zonder ingestelde klusjesDag levert nooit een signaal op, behalve als
// die specifieke dag handmatig op 'klusjesdag' is gezet.
export function klusjesDagSignalen(bereikStart, bereikEind, klusjesDag, overrides = {}) {
  return alleDatumsInBereik(bereikStart, bereikEind)
    .map((datum) => {
      const override = overrides[datum];
      const isKlusjesDag = override === 'klusjesdag' || (!override && klusjesDag && dagIndexVan(datum) + 1 === klusjesDag);
      if (!isKlusjesDag) return null;
      return { id: `klusjesdag_${datum}`, bron: 'huishouden', datum, tekst: 'Klusjes-dag', type: 'klusjesdag' };
    })
    .filter(Boolean);
}

// Huishoudtaken met een eigen interval (frequentie 'aangepast', bv. 'elke 3
// dagen') hebben geen vaste dag binnen hun cyclus — ze staan de hele cyclus
// lang open (zie HuishoudTaken.jsx). Voor een kalender-stipje moet er tóch
// één ankerdatum gekozen worden: de eerste dag van elke cyclus (dezelfde
// epoch-verankerde cyclusgrens als huidigePeriodeKey/aangepastKey in
// huishoudPeriode.js). Een cyclus die al is afgevinkt levert geen stipje op.
export function huishoudTaakSignalen(taken, log, bereikStart, bereikEind) {
  const aangepasteTaken = (taken ?? []).filter((t) => t.frequentie === 'aangepast' && t.intervalDagen > 0);
  if (aangepasteTaken.length === 0) return [];

  const signalen = [];
  alleDatumsInBereik(bereikStart, bereikEind).forEach((datum) => {
    const dagenSindsEpoch = Math.floor(new Date(datum).getTime() / (1000 * 60 * 60 * 24));
    aangepasteTaken.forEach((taak) => {
      if (dagenSindsEpoch % taak.intervalDagen !== 0) return;
      const periode = huidigePeriodeKey('aangepast', new Date(datum), taak.intervalDagen);
      if (log[taak.id]?.[periode]) return;
      signalen.push({
        id: `huishoudtaak_${taak.id}_${datum}`, bron: 'huishouden', datum,
        tekst: taak.tekst, type: 'huishoudtaak',
      });
    });
  });
  return signalen;
}

export function welzijnSignaal(laatsteCheckDatum, cadansDagen) {
  const volgende = volgendeCheckDatum(laatsteCheckDatum, cadansDagen);
  if (!volgende) return null;
  return {
    id: 'welzijn_check', bron: 'welzijn', datum: datumKey(volgende),
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
