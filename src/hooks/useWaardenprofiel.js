import { useCallback, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';

function leegProfiel() {
  return nieuwRecord({ kernwaarden: [] });
}

export function useWaardenprofiel() {
  const [profiel, setProfiel] = useState(() => leesLokaal('waardenprofiel', leegProfiel()));

  const setKernwaarden = useCallback((kernwaarden) => {
    setProfiel((huidig) => {
      const bijgewerkt = nieuwRecord({ ...huidig, kernwaarden });
      schrijfLokaal('waardenprofiel', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  return { profiel, setKernwaarden };
}
