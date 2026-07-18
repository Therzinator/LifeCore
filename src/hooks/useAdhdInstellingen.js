import { useCallback, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';

const STANDAARD = {
  starttijd: '09:00',
  eindtijd: '17:00',
  werkurenPerDag: 8,
};

function standaardRecord() {
  return nieuwRecord({ ...STANDAARD });
}

export function useAdhdInstellingen() {
  const [instellingen, setInstellingenState] = useState(() => leesLokaal('adhd_instellingen', standaardRecord()));

  const bewaar = useCallback((patch) => {
    setInstellingenState((huidig) => {
      const bijgewerkt = nieuwRecord({ ...huidig, ...patch });
      schrijfLokaal('adhd_instellingen', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const reset = useCallback(() => {
    const leeg = standaardRecord();
    schrijfLokaal('adhd_instellingen', leeg);
    setInstellingenState(leeg);
  }, []);

  return { instellingen, bewaar, reset };
}
