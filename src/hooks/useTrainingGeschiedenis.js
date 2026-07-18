import { useCallback, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';

function leegGeschiedenis() {
  return nieuwRecord({ sessies: [] });
}

export function useTrainingGeschiedenis() {
  const [geschiedenis, setGeschiedenis] = useState(() => leesLokaal('training_geschiedenis', leegGeschiedenis()));

  const voegToe = useCallback((sessie) => {
    setGeschiedenis((huidig) => {
      const bijgewerkt = nieuwRecord({ sessies: [...(huidig.sessies ?? []), sessie] });
      schrijfLokaal('training_geschiedenis', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const wis = useCallback(() => {
    const leeg = leegGeschiedenis();
    schrijfLokaal('training_geschiedenis', leeg);
    setGeschiedenis(leeg);
  }, []);

  const sessies = geschiedenis.sessies ?? [];
  const laatste = sessies.length ? sessies[sessies.length - 1] : null;

  return { sessies, laatste, voegToe, wis };
}
