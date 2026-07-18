import { useCallback, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';

const STANDAARD = {
  programma: 'sl5x5',
  rustZwaar: 90,
  rustLicht: 90,
  geluid: true,
  gewichtStap: 2.5,
  stangRecht: 20,
  stangCurl: 10,
  runKm: 25,
};

function standaardRecord() {
  return nieuwRecord({ ...STANDAARD });
}

export function useTrainingInstellingen() {
  const [instellingen, setInstellingenState] = useState(() => leesLokaal('training_instellingen', standaardRecord()));

  const bewaar = useCallback((patch) => {
    setInstellingenState((huidig) => {
      const bijgewerkt = nieuwRecord({ ...huidig, ...patch });
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
