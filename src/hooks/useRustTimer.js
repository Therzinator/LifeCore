import { useCallback, useEffect, useRef, useState } from 'react';
import { speelFragment } from '../lib/geluid/fragmenten.js';

const MAX_SECONDEN = 600;

// navigator.vibrate bestaat alleen op Chrome/Android — stilletjes een no-op
// op iOS Safari (nooit ondersteund, ook niet als geïnstalleerde PWA).
function trilBijEindeTimer() {
  navigator.vibrate?.([200, 100, 200]);
}

export function useRustTimer(geluidFragment) {
  const [resterend, setResterend] = useState(0);
  const [totaal, setTotaal] = useState(0);
  const [actief, setActief] = useState(false);
  const intervalRef = useRef(null);
  const tussensignaalRef = useRef(null);
  const tussenGespeeldRef = useRef(false);

  const stop = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setActief(false);
  }, []);

  // tussensignaal (optioneel): { bijResterend, geluidFragment } — speelt één
  // keer een eigen, los van het eindgeluid instelbaar fragment zodra de
  // timer dat aantal seconden resterend bereikt (bv. kin-naar-borst: signaal
  // bij 10s resterend van een 35s-timer = 25s erin).
  const start = useCallback((seconden, tussensignaal) => {
    clearInterval(intervalRef.current);
    setTotaal(seconden);
    setResterend(seconden);
    setActief(true);
    tussensignaalRef.current = tussensignaal ?? null;
    tussenGespeeldRef.current = false;
    intervalRef.current = setInterval(() => {
      setResterend((r) => {
        if (r <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setActief(false);
          speelFragment(geluidFragment);
          trilBijEindeTimer();
          return 0;
        }
        const volgende = r - 1;
        const tussen = tussensignaalRef.current;
        if (tussen && !tussenGespeeldRef.current && volgende <= tussen.bijResterend) {
          tussenGespeeldRef.current = true;
          speelFragment(tussen.geluidFragment);
        }
        return volgende;
      });
    }, 1000);
  }, [geluidFragment]);

  const plus = useCallback((n) => {
    setResterend((r) => Math.min(r + n, MAX_SECONDEN));
    setTotaal((t) => Math.max(t, resterend + n));
  }, [resterend]);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  return { resterend, totaal, actief, start, stop, plus };
}
