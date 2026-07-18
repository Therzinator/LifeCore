import { useCallback, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';

const STANDAARD = {
  programma: 'sl5x5',
  rustZwaar: 90,
  rustLicht: 90,
  gewichtStap: 2.5,
  stangRecht: 20,
  stangCurl: 10,
  runKm: 25,
  programmaOvergangsdatum: null,
};

function standaardRecord() {
  return nieuwRecord({ ...STANDAARD });
}

export function useTrainingInstellingen() {
  const [instellingen, setInstellingenState] = useState(() => leesLokaal('training_instellingen', standaardRecord()));

  const bewaar = useCallback((patch) => {
    setInstellingenState((huidig) => {
      const volledigePatch = { ...patch };
      // Eerste keer wisselen van programma zet automatisch de overgangsdatum —
      // dat is het moment dat de kracht-grafiek als annotatie moet tonen.
      if (patch.programma && patch.programma !== huidig.programma && !huidig.programmaOvergangsdatum) {
        volledigePatch.programmaOvergangsdatum = new Date().toISOString().slice(0, 10);
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
