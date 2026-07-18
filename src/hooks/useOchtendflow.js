import { useCallback, useState } from 'react';

export const STAPPEN = ['welkom', 'checkin', 'ademhaling', 'activering', 'brainDump', 'dagfocus', 'afronden'];

export function useOchtendflow() {
  const [stapIndex, setStapIndex] = useState(0);
  const totaal = STAPPEN.length;
  const stapNaam = STAPPEN[stapIndex];

  const volgende = useCallback(() => {
    setStapIndex((i) => Math.min(i + 1, totaal - 1));
  }, [totaal]);

  const vorige = useCallback(() => {
    setStapIndex((i) => Math.max(i - 1, 0));
  }, []);

  return { stapIndex, stapNaam, totaal, volgende, vorige, overslaan: volgende };
}
