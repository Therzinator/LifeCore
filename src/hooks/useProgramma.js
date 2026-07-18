import { useCallback, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';
import { SCHEMA } from '../lib/training/schema.js';

function standaardProgramma() {
  return nieuwRecord({ A: SCHEMA.A.map((o) => ({ ...o })), B: SCHEMA.B.map((o) => ({ ...o })) });
}

// Het volledig bewerkbare trainingsschema (welke oefeningen, sets/reps,
// increment per oefening) — los van SCHEMA, dat alleen het startpunt is.
export function useProgramma() {
  const [programma, setProgrammaState] = useState(() => leesLokaal('training_programma', standaardProgramma()));

  const bewaar = useCallback((patch) => {
    setProgrammaState((huidig) => {
      const bijgewerkt = nieuwRecord({ ...huidig, ...patch });
      schrijfLokaal('training_programma', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const voegOefeningToe = useCallback((letter, oefening) => {
    setProgrammaState((huidig) => {
      const bijgewerkt = nieuwRecord({ ...huidig, [letter]: [...huidig[letter], oefening] });
      schrijfLokaal('training_programma', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const verwijderOefening = useCallback((letter, index) => {
    setProgrammaState((huidig) => {
      const bijgewerkt = nieuwRecord({ ...huidig, [letter]: huidig[letter].filter((_, i) => i !== index) });
      schrijfLokaal('training_programma', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const bewerkOefening = useCallback((letter, index, patch) => {
    setProgrammaState((huidig) => {
      const bijgewerkt = nieuwRecord({
        ...huidig,
        [letter]: huidig[letter].map((o, i) => (i === index ? { ...o, ...patch } : o)),
      });
      schrijfLokaal('training_programma', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const verplaatsOefening = useCallback((letter, index, richting) => {
    setProgrammaState((huidig) => {
      const lijst = [...huidig[letter]];
      const doel = index + richting;
      if (doel < 0 || doel >= lijst.length) return huidig;
      [lijst[index], lijst[doel]] = [lijst[doel], lijst[index]];
      const bijgewerkt = nieuwRecord({ ...huidig, [letter]: lijst });
      schrijfLokaal('training_programma', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const resetStandaard = useCallback(() => {
    const std = standaardProgramma();
    schrijfLokaal('training_programma', std);
    setProgrammaState(std);
  }, []);

  return { programma, voegOefeningToe, verwijderOefening, bewerkOefening, verplaatsOefening, resetStandaard, bewaar };
}
