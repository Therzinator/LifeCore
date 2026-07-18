import { useCallback, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';
import { vandaagKey } from '../utils/datum.js';

function leegDag(datumKey) {
  return nieuwRecord({
    datum: datumKey,
    checkin: null,
    ademhalingGedaan: false,
    brainDump: '',
    dagfocus: null,
    afgerond: false,
    waardeVandaag: null,
    waardeTerugblik: '',
  });
}

export function useDagdata() {
  const datumKey = vandaagKey();
  const [dag, setDag] = useState(() => leesLokaal(`dag_${datumKey}`, leegDag(datumKey)));

  const bewaar = useCallback((patch) => {
    setDag((huidig) => {
      const bijgewerkt = nieuwRecord({ ...huidig, ...patch });
      schrijfLokaal(`dag_${datumKey}`, bijgewerkt);
      return bijgewerkt;
    });
  }, [datumKey]);

  const setCheckin = useCallback((checkin) => bewaar({ checkin }), [bewaar]);
  const setAdemhalingGedaan = useCallback(() => bewaar({ ademhalingGedaan: true }), [bewaar]);
  const setBrainDump = useCallback((brainDump) => bewaar({ brainDump }), [bewaar]);
  const setDagfocus = useCallback((dagfocus) => bewaar({ dagfocus }), [bewaar]);
  const setAfgerond = useCallback(() => bewaar({ afgerond: true }), [bewaar]);
  const setWaardeVandaag = useCallback((waardeVandaag) => bewaar({ waardeVandaag }), [bewaar]);
  const setWaardeTerugblik = useCallback((waardeTerugblik) => bewaar({ waardeTerugblik }), [bewaar]);

  return {
    dag,
    setCheckin,
    setAdemhalingGedaan,
    setBrainDump,
    setDagfocus,
    setAfgerond,
    setWaardeVandaag,
    setWaardeTerugblik,
  };
}
