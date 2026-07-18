import { useCallback, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';

const STANDAARD = {
  toonWelzijnSuggesties: true,
};

function standaardRecord() {
  return nieuwRecord({ ...STANDAARD });
}

export function useWaardenInstellingen() {
  const [instellingen, setInstellingenState] = useState(() => ({ ...standaardRecord(), ...leesLokaal('waarden_instellingen', {}) }));

  const bewaar = useCallback((patch) => {
    setInstellingenState((huidig) => {
      const bijgewerkt = nieuwRecord({ ...huidig, ...patch });
      schrijfLokaal('waarden_instellingen', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  return { instellingen, bewaar };
}
