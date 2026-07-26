import { useCallback, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';
import { datumKey } from '../utils/datum.js';
import { OPBOUW_STAPPEN_STANDAARD } from '../lib/training/opbouw.js';

const STANDAARD = {
  programma: 'sl5x5',
  rustZwaar: 90,
  rustLicht: 90,
  gewichtStap: 2.5,
  stangRecht: 20,
  stangCurl: 10,
  runKm: 25,
  opbouwStappen: OPBOUW_STAPPEN_STANDAARD,
  // null = ongewijzigd gedrag (opbouwreeks begint bij de lege stang) — zie
  // berekenOpbouwsets() in opbouw.js. Getal (kg) = eigen beginpunt i.p.v.
  // de kale stang.
  opbouwStartGewicht: null,
  programmaOvergangsdatum: null,
  geluidFragment: 'tweetonen',
  // Opent de rusttimer automatisch als zwevend Picture-in-Picture-venster
  // zodra een rustperiode start (zie usePipTimer.js) — zo staat 'm al klaar
  // tegen de tijd dat je de app minimaliseert, i.p.v. dat je zelf op 'Open
  // als zwevend venster' moet tikken. Alleen effect op platforms waar PiP
  // ondersteund is (o.a. Android); elders negeert de hook dit stilzwijgend.
  pipAutomatisch: true,
  // Wat er gebeurt zodra een rustperiode afloopt terwijl het zwevende
  // PiP-venster actief was (dus terwijl je ergens anders zat): 'venster'
  // toont een 'Begin volgende set'-melding zodra je zelf terugkeert naar de
  // app, 'terugNaarApp' verlaat het PiP-venster automatisch — hetzelfde als
  // zelf op de 'terug naar tabblad'-knop van het zwevende venster drukken.
  rustEindeActie: 'venster',
  eenheid: 'kg',
  // Voorkeurstijden voor de Agenda's lift/cardio-dag-suggesties (zie
  // agendaSignalen.js trainingCardioSignalen) — 's ochtends het liefst, met
  // een laatemiddag-/avond-alternatief voor als de ochtend niet lukt.
  voorkeurTijdOchtend: '07:40',
  voorkeurTijdMiddag: '16:00',
  voorkeurTijdAvond: '20:00',
};

function standaardRecord() {
  return nieuwRecord({ ...STANDAARD });
}

export function useTrainingInstellingen() {
  // Spread standaardRecord() eerst zodat een ouder, lokaal opgeslagen record dat nog
  // geen geluidFragment (of een andere later toegevoegde instelling) kent, gewoon
  // op de standaardwaarde terugvalt in plaats van undefined te blijven.
  const [instellingen, setInstellingenState] = useState(() => ({ ...standaardRecord(), ...leesLokaal('training_instellingen', {}) }));

  const bewaar = useCallback((patch) => {
    setInstellingenState((huidig) => {
      const volledigePatch = { ...patch };
      // Eerste keer wisselen van programma zet automatisch de overgangsdatum —
      // dat is het moment dat de kracht-grafiek als annotatie moet tonen.
      if (patch.programma && patch.programma !== huidig.programma && !huidig.programmaOvergangsdatum) {
        volledigePatch.programmaOvergangsdatum = datumKey();
      }
      const bijgewerkt = nieuwRecord({ ...huidig, ...volledigePatch });
      schrijfLokaal('training_instellingen', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const reset = useCallback(() => {
    const leeg = standaardRecord();
    schrijfLokaal('training_instellingen', leeg);
    setInstellingenState(leeg);
  }, []);

  return { instellingen, bewaar, reset };
}
