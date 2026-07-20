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
  programmaOvergangsdatum: null,
  geluidFragment: 'tweetonen',
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
