import { useCallback, useEffect, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';
import { volgendPlankDoel, volgendPushDoel } from '../lib/training/activeringProgressie.js';
import { datumKey } from '../utils/datum.js';

const STANDAARD = { plankDoel: 30, pushAantal: 10, laatsteBerekening: null };

function standaardRecord() {
  return nieuwRecord({ ...STANDAARD });
}

// Houdt het actuele plank-/push-up-doel bij (opbouw/deload — zie
// activeringProgressie.js) en herberekent dat precies één keer per nieuwe
// kalenderdag, niet bij elke render/wijziging binnen dezelfde dag. Los van
// die automatische opbouw blijft handmatig bijstellen (de -5s/+5s- en
// -/+-knoppen in StapActivering.jsx) gewoon mogelijk via zetPlankDoel/
// zetPushAantal.
export function useActiveringProgressie(sessies) {
  const [state, setState] = useState(() => ({ ...standaardRecord(), ...leesLokaal('activering_progressie', {}) }));
  const vandaag = datumKey();

  useEffect(() => {
    if (state.laatsteBerekening === vandaag) return;
    setState((huidig) => {
      const plankDoel = volgendPlankDoel(sessies, huidig.plankDoel, vandaag);
      const pushAantal = volgendPushDoel(sessies, huidig.pushAantal, vandaag);
      const bijgewerkt = nieuwRecord({ plankDoel, pushAantal, laatsteBerekening: vandaag });
      schrijfLokaal('activering_progressie', bijgewerkt);
      return bijgewerkt;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- alleen herberekenen bij een nieuwe kalenderdag, niet bij elke wijziging van sessies binnen dezelfde dag.
  }, [vandaag]);

  const zetPlankDoel = useCallback((plankDoel) => {
    setState((huidig) => {
      const bijgewerkt = nieuwRecord({ ...huidig, plankDoel });
      schrijfLokaal('activering_progressie', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const zetPushAantal = useCallback((pushAantal) => {
    setState((huidig) => {
      const bijgewerkt = nieuwRecord({ ...huidig, pushAantal });
      schrijfLokaal('activering_progressie', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  return { plankDoel: state.plankDoel, pushAantal: state.pushAantal, zetPlankDoel, zetPushAantal };
}
