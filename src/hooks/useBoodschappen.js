import { useCallback, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';

function leegRecord() {
  return nieuwRecord({ items: [] });
}

function nieuweId() {
  return `bd_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// 'Zelflerend': een item verdwijnt niet als het gekocht is, het verhuist
// alleen van de actieve lijst (opLijst) naar de 'laatst gekocht'-catalogus
// (laatstGekochtOp gezet) — zo hoef je een vaak terugkerend boodschapje
// nooit opnieuw in te typen, alleen met één tik weer op de lijst te zetten.
export function useBoodschappen() {
  const [record, setRecordState] = useState(() => leesLokaal('boodschappen', leegRecord()));

  const voegToe = useCallback((tekst, frequentie) => {
    setRecordState((huidig) => {
      const items = [
        ...(huidig.items ?? []),
        { id: nieuweId(), tekst, frequentie, aantal: 1, opLijst: true, laatstGekochtOp: null },
      ];
      const bijgewerkt = nieuwRecord({ items });
      schrijfLokaal('boodschappen', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const zetAantal = useCallback((id, aantal) => {
    setRecordState((huidig) => {
      const items = (huidig.items ?? []).map((i) => (i.id === id ? { ...i, aantal: Math.max(1, aantal) } : i));
      const bijgewerkt = nieuwRecord({ items });
      schrijfLokaal('boodschappen', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const toggleGekocht = useCallback((id) => {
    setRecordState((huidig) => {
      const items = (huidig.items ?? []).map((i) => (
        i.id === id ? { ...i, opLijst: false, laatstGekochtOp: new Date().toISOString() } : i
      ));
      const bijgewerkt = nieuwRecord({ items });
      schrijfLokaal('boodschappen', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const heractiveren = useCallback((id) => {
    setRecordState((huidig) => {
      const items = (huidig.items ?? []).map((i) => (i.id === id ? { ...i, opLijst: true } : i));
      const bijgewerkt = nieuwRecord({ items });
      schrijfLokaal('boodschappen', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const verwijder = useCallback((id) => {
    setRecordState((huidig) => {
      const bijgewerkt = nieuwRecord({ items: (huidig.items ?? []).filter((i) => i.id !== id) });
      schrijfLokaal('boodschappen', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  return { items: record.items ?? [], voegToe, zetAantal, toggleGekocht, heractiveren, verwijder };
}
