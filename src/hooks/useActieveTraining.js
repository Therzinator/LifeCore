import { useCallback, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';

function legeTraining() {
  return nieuwRecord({ letter: null, oefeningen: null, extras: null, wuRoei: false, wuMob: false });
}

// Oefeningen uit een oudere appversie (vóór per-set gewicht/reps) missen
// `werk`/`setGew`/`setReps` — zonder deze check crasht TrainingSessie op zo'n
// verouderde, nog actieve training in plaats van 'm gewoon te negeren.
export function isGeldigeTraining(training) {
  if (!training?.letter) return true;
  if (!Array.isArray(training.oefeningen)) return false;
  const geldigeOef = (o) => Array.isArray(o.werk) && Array.isArray(o.setGew) && Array.isArray(o.setReps);
  if (!training.oefeningen.every(geldigeOef)) return false;
  if (training.extras && !training.extras.every(geldigeOef)) return false;
  return true;
}

function leesActieveTraining() {
  const gelezen = leesLokaal('training_actief', legeTraining());
  if (isGeldigeTraining(gelezen)) return gelezen;
  const leeg = legeTraining();
  schrijfLokaal('training_actief', leeg);
  return leeg;
}

export function useActieveTraining() {
  const [training, setTrainingState] = useState(() => leesActieveTraining());

  const bewaar = useCallback((patch) => {
    setTrainingState((huidig) => {
      const bijgewerkt = nieuwRecord({ ...huidig, ...patch });
      schrijfLokaal('training_actief', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const startTraining = useCallback((letter, oefeningen, extras) => {
    bewaar({ letter, datum: new Date().toISOString(), oefeningen, extras, wuRoei: false, wuMob: false });
  }, [bewaar]);

  const setOefeningen = useCallback((oefeningen) => {
    bewaar({ oefeningen });
  }, [bewaar]);

  const setExtras = useCallback((extras) => {
    bewaar({ extras });
  }, [bewaar]);

  const setWarmup = useCallback((patch) => {
    bewaar(patch);
  }, [bewaar]);

  const wisTraining = useCallback(() => {
    const leeg = legeTraining();
    schrijfLokaal('training_actief', leeg);
    setTrainingState(leeg);
  }, []);

  return { training, startTraining, setOefeningen, setExtras, setWarmup, wisTraining };
}
