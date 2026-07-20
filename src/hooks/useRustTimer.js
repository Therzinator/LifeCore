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

  const stop = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setActief(false);
  }, []);

  const start = useCallback((seconden) => {
    clearInterval(intervalRef.current);
    setTotaal(seconden);
    setResterend(seconden);
    setActief(true);
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
        return r - 1;
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
