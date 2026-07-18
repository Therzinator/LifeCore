import { useCallback, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';
import { PROFIELEN } from '../lib/training/schema.js';

function leegProfiel() {
  return nieuwRecord({ profielNaam: null, gewichten: null });
}

export function useTrainingProfiel() {
  const [profiel, setProfielState] = useState(() => leesLokaal('training_profiel', leegProfiel()));

  const kiesProfiel = useCallback((profielNaam) => {
    const bijgewerkt = nieuwRecord({ profielNaam, gewichten: { ...PROFIELEN[profielNaam] } });
    schrijfLokaal('training_profiel', bijgewerkt);
    setProfielState(bijgewerkt);
  }, []);

  const setGewicht = useCallback((oefeningId, gewicht) => {
    setProfielState((huidig) => {
      const bijgewerkt = nieuwRecord({ ...huidig, gewichten: { ...huidig.gewichten, [oefeningId]: gewicht } });
      schrijfLokaal('training_profiel', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  return { profiel, kiesProfiel, setGewicht };
}
