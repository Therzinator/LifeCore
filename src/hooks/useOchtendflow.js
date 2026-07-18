import { useCallback, useEffect, useState } from 'react';
import { STAPPEN_CONFIGUREERBAAR } from './useOchtendInstellingen.js';

// Elke stap-overgang krijgt een eigen browser-geschiedenis-entry
// ({pagina:'ochtend', stap:N}), zodat de mobiele terugknop/-gebaar en de
// in-app 'Terug'-knop stapsgewijs door de wizard heen gaan i.p.v. de hele
// module in één keer te verlaten: vanuit stap N>0 ga je naar stap N-1,
// vanuit stap 0 (welkom) verlaat de eerstvolgende terug-actie de wizard
// naar het punt waar App.jsx 'm binnenkwam (de vaste module-entry uit
// setPagina, zonder 'stap'-veld) — daarna pakt App.jsx's eigen
// popstate-handler het over en gaat terug naar snelkeuze.
export function useOchtendflow(instellingen) {
  const volgorde = instellingen?.stappenVolgorde ?? STAPPEN_CONFIGUREERBAAR;
  const aan = instellingen?.stappenAan ?? {};
  const stappen = ['welkom', ...volgorde.filter((id) => aan[id] !== false), 'afronden'];

  const [stapIndex, setStapIndex] = useState(0);
  const totaal = stappen.length;
  const stapNaam = stappen[Math.min(stapIndex, totaal - 1)];

  const volgende = useCallback(() => {
    setStapIndex((i) => {
      const nieuw = Math.min(i + 1, totaal - 1);
      if (nieuw !== i) window.history.pushState({ pagina: 'ochtend', stap: nieuw }, '');
      return nieuw;
    });
  }, [totaal]);

  // Roept de browser-geschiedenis aan i.p.v. direct stapIndex te verlagen —
  // zo geven de in-app 'Terug'-knop en de mobiele terugknop exact hetzelfde
  // gedrag (beide lopen via dezelfde popstate-listener hieronder).
  const vorige = useCallback(() => {
    window.history.back();
  }, []);

  useEffect(() => {
    function opPopState(e) {
      if (e.state?.pagina !== 'ochtend') return;
      setStapIndex(e.state.stap ?? 0);
    }
    window.addEventListener('popstate', opPopState);
    return () => window.removeEventListener('popstate', opPopState);
  }, []);

  return { stapIndex, stapNaam, totaal, volgende, vorige, overslaan: volgende };
}
