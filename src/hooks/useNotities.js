import { useCallback, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';

function leegRecord() {
  return nieuwRecord({ notities: [] });
}

function nieuweId() {
  return `notitie_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// Losse, snelle notities tijdens gebruik van een module — bewust een platte
// lijst i.p.v. per-module opslag, zodat één exportactie (zie
// lib/notities/notitieExport.js) altijd alles in één keer meeneemt.
export function useNotities() {
  const [record, setRecordState] = useState(() => leesLokaal('notities', leegRecord()));

  const voegToe = useCallback((moduleId, substap, tekst) => {
    const schoon = tekst.trim();
    if (!schoon) return;
    setRecordState((huidig) => {
      const nieuw = { id: nieuweId(), moduleId, substap: substap ?? null, tekst: schoon, aangemaaktOp: new Date().toISOString() };
      const bijgewerkt = nieuwRecord({ notities: [nieuw, ...(huidig.notities ?? [])] });
      schrijfLokaal('notities', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const verwijder = useCallback((id) => {
    setRecordState((huidig) => {
      const bijgewerkt = nieuwRecord({ notities: (huidig.notities ?? []).filter((n) => n.id !== id) });
      schrijfLokaal('notities', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const wisAlles = useCallback(() => {
    const bijgewerkt = nieuwRecord({ notities: [] });
    schrijfLokaal('notities', bijgewerkt);
    setRecordState(bijgewerkt);
  }, []);

  return { notities: record.notities ?? [], voegToe, verwijder, wisAlles };
}
