import { useCallback, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';
import { vandaagKey } from '../utils/datum.js';

function legeDag(datumKey) {
  return nieuwRecord({
    datum: datumKey,
    focusMinuten: 0,
    pauzes: 0,
    onderbrekingen: 0,
    middagEnergie: null,
    stemming: null,
    reflectie: '',
    morgenPrio: '',
    shutdown: [false, false, false, false],
    afgerond: false,
  });
}

export function useAdhdDag() {
  const datumKey = vandaagKey();
  const [dag, setDag] = useState(() => leesLokaal(`adhd_dag_${datumKey}`, legeDag(datumKey)));

  const bewaar = useCallback((patch) => {
    setDag((huidig) => {
      const bijgewerkt = nieuwRecord({ ...huidig, ...patch });
      schrijfLokaal(`adhd_dag_${datumKey}`, bijgewerkt);
      return bijgewerkt;
    });
  }, [datumKey]);

  const voegFocusMinutenToe = useCallback((minuten) => {
    setDag((huidig) => {
      const bijgewerkt = nieuwRecord({ ...huidig, focusMinuten: huidig.focusMinuten + minuten });
      schrijfLokaal(`adhd_dag_${datumKey}`, bijgewerkt);
      return bijgewerkt;
    });
  }, [datumKey]);

  const voegPauzeToe = useCallback(() => {
    setDag((huidig) => {
      const bijgewerkt = nieuwRecord({ ...huidig, pauzes: huidig.pauzes + 1 });
      schrijfLokaal(`adhd_dag_${datumKey}`, bijgewerkt);
      return bijgewerkt;
    });
  }, [datumKey]);

  const voegOnderbrekingToe = useCallback(() => {
    setDag((huidig) => {
      const bijgewerkt = nieuwRecord({ ...huidig, onderbrekingen: huidig.onderbrekingen + 1 });
      schrijfLokaal(`adhd_dag_${datumKey}`, bijgewerkt);
      return bijgewerkt;
    });
  }, [datumKey]);

  const setMiddagEnergie = useCallback((middagEnergie) => bewaar({ middagEnergie }), [bewaar]);
  const setStemming = useCallback((stemming) => bewaar({ stemming }), [bewaar]);
  const setReflectie = useCallback((reflectie) => bewaar({ reflectie }), [bewaar]);
  const setMorgenPrio = useCallback((morgenPrio) => bewaar({ morgenPrio }), [bewaar]);

  const vinkShutdown = useCallback((idx) => {
    const shutdown = dag.shutdown.map((v, i) => (i === idx ? !v : v));
    bewaar({ shutdown });
  }, [bewaar, dag.shutdown]);

  const setAfgerond = useCallback(() => bewaar({ afgerond: true }), [bewaar]);

  const wis = useCallback(() => {
    const leeg = legeDag(datumKey);
    schrijfLokaal(`adhd_dag_${datumKey}`, leeg);
    setDag(leeg);
  }, [datumKey]);

  return {
    dag,
    voegFocusMinutenToe,
    voegPauzeToe,
    voegOnderbrekingToe,
    setMiddagEnergie,
    setStemming,
    setReflectie,
    setMorgenPrio,
    vinkShutdown,
    setAfgerond,
    wis,
  };
}
