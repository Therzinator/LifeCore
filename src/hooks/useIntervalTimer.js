import { useCallback, useEffect, useRef, useState } from 'react';
import { speelFragment } from '../lib/geluid/fragmenten.js';

// Lopende timer door een reeks fasen (stappen) heen — elke stap heeft een
// duur in minuten (fractioneel voor korte HIIT-intervallen, bv. 0.5 = 30s).
// Speelt geluidFragment bij elke faseovergang, telt automatisch door naar de
// volgende fase, en markeert voltooid na de laatste stap.
export function useIntervalTimer(stappen, geluidFragment) {
  const [stapIndex, setStapIndex] = useState(0);
  const [resterend, setResterend] = useState(() => Math.round((stappen[0]?.duur ?? 0) * 60));
  const [actief, setActief] = useState(false);
  const [voltooid, setVoltooid] = useState(false);
  const intervalRef = useRef(null);
  const stapIndexRef = useRef(0);

  const pauzeer = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setActief(false);
  }, []);

  const stop = useCallback(() => {
    pauzeer();
    stapIndexRef.current = 0;
    setStapIndex(0);
    setResterend(Math.round((stappen[0]?.duur ?? 0) * 60));
    setVoltooid(false);
  }, [pauzeer, stappen]);

  const start = useCallback(() => {
    if (stappen.length === 0) return;
    clearInterval(intervalRef.current);
    setVoltooid(false);
    setActief(true);
    intervalRef.current = setInterval(() => {
      setResterend((r) => {
        if (r > 1) return r - 1;

        speelFragment(geluidFragment);
        const volgendeIndex = stapIndexRef.current + 1;
        if (volgendeIndex >= stappen.length) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setActief(false);
          setVoltooid(true);
          return 0;
        }
        stapIndexRef.current = volgendeIndex;
        setStapIndex(volgendeIndex);
        return Math.round(stappen[volgendeIndex].duur * 60);
      });
    }, 1000);
  }, [stappen, geluidFragment]);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  return {
    stapIndex,
    stap: stappen[stapIndex] ?? null,
    resterend,
    actief,
    voltooid,
    totaalStappen: stappen.length,
    start,
    pauzeer,
    stop,
  };
}
