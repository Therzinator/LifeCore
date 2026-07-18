import { useCallback, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';

function leegGeschiedenis() {
  return nieuwRecord({ afnames: [] });
}

export function useVragenlijstGeschiedenis(sleutel) {
  const [geschiedenis, setGeschiedenis] = useState(() => leesLokaal(sleutel, leegGeschiedenis()));

  const voegToe = useCallback((antwoorden, scores) => {
    setGeschiedenis((huidig) => {
      const nieuweAfname = { datum: new Date().toISOString(), antwoorden, scores };
      const bijgewerkt = nieuwRecord({ afnames: [...(huidig.afnames ?? []), nieuweAfname] });
      schrijfLokaal(sleutel, bijgewerkt);
      return bijgewerkt;
    });
  }, [sleutel]);

  const afnames = geschiedenis.afnames ?? [];
  const laatste = afnames.length ? afnames[afnames.length - 1] : null;
  const vorige = afnames.length > 1 ? afnames[afnames.length - 2] : null;

  return { afnames, laatste, vorige, voegToe };
}
