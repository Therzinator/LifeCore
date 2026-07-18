import { useCallback, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';

function leegProfiel() {
  return nieuwRecord({ naam: '', geslacht: '', leeftijd: null, lengte: null, lichaamsgewicht: null });
}

export function usePersoonsProfiel() {
  const [profiel, setProfielState] = useState(() => leesLokaal('training_persoonsprofiel', leegProfiel()));

  const bewaar = useCallback((patch) => {
    setProfielState((huidig) => {
      const bijgewerkt = nieuwRecord({ ...huidig, ...patch });
      schrijfLokaal('training_persoonsprofiel', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  return { profiel, bewaar };
}
