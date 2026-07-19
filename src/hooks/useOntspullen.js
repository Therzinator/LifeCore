import { useCallback, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';

function leegRecord() {
  return nieuwRecord({ items: [] });
}

function nieuweId() {
  return `os_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// Spullen die het huis uit gaan — via weggeefhoek, marktplaats, of gewoon
// bij het vuil. Elk item krijgt precies één methode (geen combinatie nodig:
// je kiest hoe iets weggaat, niet meerdere manieren tegelijk).
export function useOntspullen() {
  const [record, setRecordState] = useState(() => leesLokaal('ontspullen', leegRecord()));

  const voegToe = useCallback((tekst, methode) => {
    setRecordState((huidig) => {
      const items = [...(huidig.items ?? []), { id: nieuweId(), tekst, methode, afgerond: false, afgerondOp: null }];
      const bijgewerkt = nieuwRecord({ items });
      schrijfLokaal('ontspullen', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const toggle = useCallback((id) => {
    setRecordState((huidig) => {
      const items = (huidig.items ?? []).map((i) => {
        if (i.id !== id) return i;
        const afgerond = !i.afgerond;
        return { ...i, afgerond, afgerondOp: afgerond ? new Date().toISOString() : null };
      });
      const bijgewerkt = nieuwRecord({ items });
      schrijfLokaal('ontspullen', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const verwijder = useCallback((id) => {
    setRecordState((huidig) => {
      const bijgewerkt = nieuwRecord({ items: (huidig.items ?? []).filter((i) => i.id !== id) });
      schrijfLokaal('ontspullen', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  return { items: record.items ?? [], voegToe, toggle, verwijder };
}
