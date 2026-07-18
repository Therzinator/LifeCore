import { useCallback, useEffect, useRef, useState } from 'react';
import { speelFragment } from '../lib/geluid/fragmenten.js';

// Lopende timer door een reeks fasen (stappen) heen — elke stap heeft een
// duur in minuten (fractioneel voor korte HIIT-intervallen, bv. 0.5 = 30s).
// Speelt geluidFragment bij elke automatische faseovergang, telt door naar
// de volgende fase, en markeert voltooid na de laatste stap. Handmatig
// skippen/terugspoelen via volgendeFase()/vorigeFase() speelt geen geluid —
// dat is voor de gebruiker zelf al een bewuste actie.
//
// 'sleutel' identificeert WELK programma er geladen is (bv. het niveau-id).
// stappen is bij elke render een nieuwe array-referentie (het roeiprogramma
// wordt niet gememoized), dus de interne state kan niet simpelweg op
// stappen zelf resetten — dat zou bij elke render resetten. In plaats
// daarvan reset een effect expliciet zodra sleutel verandert (een echte
// programmawissel), via een ref zodat de state altijd de actuele stappen
// gebruikt i.p.v. een gesloten-over, mogelijk verouderde waarde.
export function useIntervalTimer(stappen, geluidFragment, sleutel) {
  const [stapIndex, setStapIndex] = useState(0);
  const [resterend, setResterend] = useState(() => Math.round((stappen[0]?.duur ?? 0) * 60));
  const [actief, setActief] = useState(false);
  const [voltooid, setVoltooid] = useState(false);
  const intervalRef = useRef(null);
  const stapIndexRef = useRef(0);
  const stappenRef = useRef(stappen);
  stappenRef.current = stappen;

  const pauzeer = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setActief(false);
  }, []);

  const stop = useCallback(() => {
    pauzeer();
    stapIndexRef.current = 0;
    setStapIndex(0);
    setResterend(Math.round((stappenRef.current[0]?.duur ?? 0) * 60));
    setVoltooid(false);
  }, [pauzeer]);

  // Echte programmawissel (ander niveau/programma) — reset altijd, ook als
  // de timer nog liep.
  useEffect(() => {
    stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- alleen bij een programmawissel (sleutel) resetten, niet bij elke render van stappen (nieuwe array-referentie elke keer).
  }, [sleutel]);

  const start = useCallback(() => {
    if (stappenRef.current.length === 0) return;
    clearInterval(intervalRef.current);
    setVoltooid(false);
    setActief(true);
    intervalRef.current = setInterval(() => {
      setResterend((r) => {
        if (r > 1) return r - 1;

        speelFragment(geluidFragment);
        const volgendeIndex = stapIndexRef.current + 1;
        if (volgendeIndex >= stappenRef.current.length) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setActief(false);
          setVoltooid(true);
          return 0;
        }
        stapIndexRef.current = volgendeIndex;
        setStapIndex(volgendeIndex);
        return Math.round(stappenRef.current[volgendeIndex].duur * 60);
      });
    }, 1000);
  }, [geluidFragment]);

  const naarFase = useCallback((index) => {
    const begrensd = Math.max(0, Math.min(index, stappenRef.current.length - 1));
    stapIndexRef.current = begrensd;
    setStapIndex(begrensd);
    setResterend(Math.round(stappenRef.current[begrensd].duur * 60));
    setVoltooid(false);
  }, []);

  const volgendeFase = useCallback(() => naarFase(stapIndexRef.current + 1), [naarFase]);
  const vorigeFase = useCallback(() => naarFase(stapIndexRef.current - 1), [naarFase]);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  return {
    stapIndex,
    stap: stappen[stapIndex] ?? null,
    resterend,
    actief,
    voltooid,
    totaalStappen: stappen.length,
    isEersteFase: stapIndex === 0,
    isLaatsteFase: stapIndex === stappen.length - 1,
    start,
    pauzeer,
    stop,
    volgendeFase,
    vorigeFase,
  };
}
