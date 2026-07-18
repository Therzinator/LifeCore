import { useCallback, useState } from 'react';
import { STAPPEN_CONFIGUREERBAAR } from './useOchtendInstellingen.js';

export function useOchtendflow(instellingen) {
  const volgorde = instellingen?.stappenVolgorde ?? STAPPEN_CONFIGUREERBAAR;
  const aan = instellingen?.stappenAan ?? {};
  const stappen = ['welkom', ...volgorde.filter((id) => aan[id] !== false), 'afronden'];

  const [stapIndex, setStapIndex] = useState(0);
  const totaal = stappen.length;
  const stapNaam = stappen[Math.min(stapIndex, totaal - 1)];

  const volgende = useCallback(() => {
    setStapIndex((i) => Math.min(i + 1, totaal - 1));
  }, [totaal]);

  const vorige = useCallback(() => {
    setStapIndex((i) => Math.max(i - 1, 0));
  }, []);

  return { stapIndex, stapNaam, totaal, volgende, vorige, overslaan: volgende };
}
