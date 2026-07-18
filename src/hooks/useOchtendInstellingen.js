import { useCallback, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';

// 'welkom' en 'afronden' zijn vaste intro/outro-stappen, niet uit te zetten
// of te verplaatsen — alleen de stappen hieronder zijn configureerbaar.
export const STAPPEN_CONFIGUREERBAAR = ['checkin', 'ademhaling', 'activering', 'brainDump', 'dagfocus'];

export const STAP_LABELS = {
  checkin: 'Check-in',
  ademhaling: 'Ademhaling',
  activering: 'Activering (plank)',
  brainDump: 'Brain dump',
  dagfocus: 'Dagfocus',
};

const STANDAARD = {
  geluidFragment: 'tweetonen',
  starttijd: '07:00',
  stappenVolgorde: [...STAPPEN_CONFIGUREERBAAR],
  stappenAan: { checkin: true, ademhaling: true, activering: true, brainDump: true, dagfocus: true },
};

function standaardRecord() {
  return nieuwRecord({ ...STANDAARD });
}

export function useOchtendInstellingen() {
  const [instellingen, setInstellingenState] = useState(() => ({ ...standaardRecord(), ...leesLokaal('ochtend_instellingen', {}) }));

  const bewaar = useCallback((patch) => {
    setInstellingenState((huidig) => {
      const bijgewerkt = nieuwRecord({ ...huidig, ...patch });
      schrijfLokaal('ochtend_instellingen', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  return { instellingen, bewaar };
}
