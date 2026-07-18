import { useCallback, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';
import { vandaagKey } from '../utils/datum.js';

function leegRecord() {
  return nieuwRecord({ dagen: {} });
}

export function useCardioChecklist() {
  const [record, setRecordState] = useState(() => leesLokaal('cardio_checklist', leegRecord()));

  const toggle = useCallback((activiteitId, datumIso = vandaagKey()) => {
    setRecordState((huidig) => {
      const dagen = { ...huidig.dagen };
      const dag = { ...(dagen[datumIso] ?? {}) };
      dag[activiteitId] = !dag[activiteitId];
      dagen[datumIso] = dag;
      const bijgewerkt = nieuwRecord({ dagen });
      schrijfLokaal('cardio_checklist', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  return { dagen: record.dagen ?? {}, toggle, vandaag: record.dagen?.[vandaagKey()] ?? {} };
}
