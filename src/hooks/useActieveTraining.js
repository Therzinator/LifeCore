import { useCallback, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';

function legeTraining() {
  return nieuwRecord({ letter: null, oefeningen: null });
}

export function useActieveTraining() {
  const [training, setTrainingState] = useState(() => leesLokaal('training_actief', legeTraining()));

  const bewaar = useCallback((patch) => {
    setTrainingState((huidig) => {
      const bijgewerkt = nieuwRecord({ ...huidig, ...patch });
      schrijfLokaal('training_actief', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const startTraining = useCallback((letter, oefeningen) => {
    bewaar({ letter, oefeningen });
  }, [bewaar]);

  const setOefeningen = useCallback((oefeningen) => {
    bewaar({ oefeningen });
  }, [bewaar]);

  const wisTraining = useCallback(() => {
    const leeg = legeTraining();
    schrijfLokaal('training_actief', leeg);
    setTrainingState(leeg);
  }, []);

  return { training, startTraining, setOefeningen, wisTraining };
}
