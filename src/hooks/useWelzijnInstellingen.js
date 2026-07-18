import { useCallback, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';

const STANDAARD = {
  cadansDagen: 14,
  mindfulnessImpactPct: 50,
};

function standaardRecord() {
  return nieuwRecord({ ...STANDAARD });
}

export function useWelzijnInstellingen() {
  const [instellingen, setInstellingenState] = useState(() => ({ ...standaardRecord(), ...leesLokaal('welzijn_instellingen', {}) }));

  const bewaar = useCallback((patch) => {
    setInstellingenState((huidig) => {
      const bijgewerkt = nieuwRecord({ ...huidig, ...patch });
      schrijfLokaal('welzijn_instellingen', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  return { instellingen, bewaar };
}
