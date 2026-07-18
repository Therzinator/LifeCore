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

  // Herbereken alle startgewichten vanuit een profiel + een gelijke aanpassing (kg) erbovenop —
  // gebruikt door het persoonsprofielscherm om in één keer alle lifts te herijken.
  const stelGewichtenIn = useCallback((profielNaam, delta = 0) => {
    const basis = PROFIELEN[profielNaam];
    const gewichten = {};
    Object.entries(basis).forEach(([id, gewicht]) => {
      gewichten[id] = Math.max(1.25, Math.round((gewicht + delta) * 100) / 100);
    });
    const bijgewerkt = nieuwRecord({ profielNaam, gewichten });
    schrijfLokaal('training_profiel', bijgewerkt);
    setProfielState(bijgewerkt);
  }, []);

  const wisProfiel = useCallback(() => {
    const leeg = leegProfiel();
    schrijfLokaal('training_profiel', leeg);
    setProfielState(leeg);
  }, []);

  return { profiel, kiesProfiel, setGewicht, stelGewichtenIn, wisProfiel };
}
