import { useCallback, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';

function leegRecord() {
  return nieuwRecord({ sessies: [] });
}

export function useCardioSessies() {
  const [record, setRecordState] = useState(() => leesLokaal('cardio_sessies', leegRecord()));

  const voegToe = useCallback((sessie) => {
    setRecordState((huidig) => {
      const bijgewerkt = nieuwRecord({ sessies: [{ ...sessie, id: Date.now() }, ...(huidig.sessies ?? [])] });
      schrijfLokaal('cardio_sessies', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const verwijder = useCallback((id) => {
    setRecordState((huidig) => {
      const bijgewerkt = nieuwRecord({ sessies: (huidig.sessies ?? []).filter((s) => s.id !== id) });
      schrijfLokaal('cardio_sessies', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  return { sessies: record.sessies ?? [], voegToe, verwijder };
}
