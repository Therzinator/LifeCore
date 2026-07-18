import { useCallback, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';

function leegRecord() {
  return nieuwRecord({ actief: [] });
}

export function useExtraOefeningen() {
  const [record, setRecordState] = useState(() => leesLokaal('training_extra', leegRecord()));

  const toggle = useCallback((id, aan) => {
    setRecordState((huidig) => {
      const actief = huidig.actief ?? [];
      const nieuw = aan
        ? (actief.includes(id) ? actief : [...actief, id])
        : actief.filter((x) => x !== id);
      const bijgewerkt = nieuwRecord({ actief: nieuw });
      schrijfLokaal('training_extra', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const wisAlles = useCallback(() => {
    const leeg = leegRecord();
    schrijfLokaal('training_extra', leeg);
    setRecordState(leeg);
  }, []);

  return { actief: record.actief ?? [], toggle, wisAlles };
}
