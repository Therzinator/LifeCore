import { useCallback, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';

function leegRecord() {
  return nieuwRecord({ blokken: [] });
}

function nieuweId() {
  return `agb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function useAgendaBlokken() {
  const [record, setRecordState] = useState(() => leesLokaal('agenda_blokken', leegRecord()));

  const voegToe = useCallback((blok) => {
    setRecordState((huidig) => {
      const nieuw = { id: nieuweId(), herhaling: null, ...blok };
      const bijgewerkt = nieuwRecord({ blokken: [...(huidig.blokken ?? []), nieuw] });
      schrijfLokaal('agenda_blokken', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const bewerk = useCallback((id, patch) => {
    setRecordState((huidig) => {
      const blokken = huidig.blokken.map((b) => (b.id === id ? { ...b, ...patch } : b));
      const bijgewerkt = nieuwRecord({ blokken });
      schrijfLokaal('agenda_blokken', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const verwijder = useCallback((id) => {
    setRecordState((huidig) => {
      const bijgewerkt = nieuwRecord({ blokken: huidig.blokken.filter((b) => b.id !== id) });
      schrijfLokaal('agenda_blokken', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  return { blokken: record.blokken ?? [], voegToe, bewerk, verwijder };
}
