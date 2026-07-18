import { useCallback, useEffect, useRef, useState } from 'react';

const MAX_SECONDEN = 600;

function speelSignaal() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    const nu = ctx.currentTime;
    // Twee korte tonen — eenvoudig, herkenbaar "rust voorbij"-signaal.
    [[880, 0], [660, 0.16]].forEach(([freq, vertraging]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.001, nu + vertraging);
      gain.gain.exponentialRampToValueAtTime(0.3, nu + vertraging + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, nu + vertraging + 0.35);
      osc.connect(gain).connect(ctx.destination);
      osc.start(nu + vertraging);
      osc.stop(nu + vertraging + 0.4);
    });
    setTimeout(() => ctx.close(), 800);
  } catch {
    // Web Audio niet beschikbaar — stilletjes negeren.
  }
}

export function useRustTimer(geluidAan = true) {
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
          if (geluidAan) speelSignaal();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
  }, [geluidAan]);

  const plus = useCallback((n) => {
    setResterend((r) => Math.min(r + n, MAX_SECONDEN));
    setTotaal((t) => Math.max(t, resterend + n));
  }, [resterend]);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  return { resterend, totaal, actief, start, stop, plus };
}
