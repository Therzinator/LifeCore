import { useCallback, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';

const STANDAARD = {
  starttijd: '09:00',
  eindtijd: '17:00',
  werkurenPerDag: 8,
  geluidFragment: 'tweetonen',
};

function standaardRecord() {
  return nieuwRecord({ ...STANDAARD });
}

export function useAdhdInstellingen() {
  // Spread standaardRecord() eerst zodat een ouder, lokaal opgeslagen record dat nog
  // geen geluidFragment (of een andere later toegevoegde instelling) kent, gewoon
  // op de standaardwaarde terugvalt in plaats van undefined te blijven.
  const [instellingen, setInstellingenState] = useState(() => ({ ...standaardRecord(), ...leesLokaal('adhd_instellingen', {}) }));

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
