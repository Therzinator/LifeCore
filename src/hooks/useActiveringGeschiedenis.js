import { useCallback, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';

function leegGeschiedenis() {
  return nieuwRecord({ sessies: [] });
}

// Eén entry per dag waarop de Ochtend-activering-stap plank/push-ups
// registreert (upsert op datum, i.p.v. useTrainingGeschiedenis's append-only
// lijst) — een gebruiker kan binnen dezelfde dag meerdere keren 'gedaan'
// aan/uit zetten, dat hoort één regel te blijven i.p.v. duplicaten. Voedt
// activeringProgressie.js voor de wekelijkse opbouw/deload-berekening.
export function useActiveringGeschiedenis() {
  const [geschiedenis, setGeschiedenis] = useState(() => leesLokaal('activering_geschiedenis', leegGeschiedenis()));

  const registreer = useCallback((datum, patch) => {
    setGeschiedenis((huidig) => {
      const sessies = huidig.sessies ?? [];
      const index = sessies.findIndex((s) => s.datum === datum);
      const nieuweSessie = index >= 0 ? { ...sessies[index], ...patch } : { datum, ...patch };
      const nieuweSessies = index >= 0
        ? sessies.map((s, i) => (i === index ? nieuweSessie : s))
        : [...sessies, nieuweSessie];
      const bijgewerkt = nieuwRecord({ sessies: nieuweSessies });
      schrijfLokaal('activering_geschiedenis', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const wis = useCallback(() => {
    const leeg = leegGeschiedenis();
    schrijfLokaal('activering_geschiedenis', leeg);
    setGeschiedenis(leeg);
  }, []);

  return { sessies: geschiedenis.sessies ?? [], registreer, wis };
}
