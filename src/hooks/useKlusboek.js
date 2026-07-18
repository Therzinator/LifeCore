import { useCallback, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';

function leegRecord() {
  return nieuwRecord({ items: [] });
}

// Klusboek is een herbruikbare bibliotheek van kleine taken (los van de dag) —
// items blijven staan nadat je ze naar "vandaag" haalt, zodat terugkerende
// kleine klussen niet elke keer opnieuw ingetypt hoeven te worden.
export function useKlusboek() {
  const [record, setRecordState] = useState(() => leesLokaal('adhd_klusboek', leegRecord()));

  const voegToe = useCallback((naam, minuten) => {
    setRecordState((huidig) => {
      const items = [...(huidig.items ?? []), { id: `kb_${Date.now()}`, naam, minuten }];
      const bijgewerkt = nieuwRecord({ items });
      schrijfLokaal('adhd_klusboek', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const verwijder = useCallback((id) => {
    setRecordState((huidig) => {
      const bijgewerkt = nieuwRecord({ items: (huidig.items ?? []).filter((k) => k.id !== id) });
      schrijfLokaal('adhd_klusboek', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  return { items: record.items ?? [], voegToe, verwijder };
}
