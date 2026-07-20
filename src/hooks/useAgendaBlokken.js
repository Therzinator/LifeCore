import { useCallback, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';

function leegRecord() {
  return nieuwRecord({ blokken: [], log: {} });
}

function nieuweId() {
  return `agb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function useAgendaBlokken() {
  const [record, setRecordState] = useState(() => leesLokaal('agenda_blokken', leegRecord()));

  const voegToe = useCallback((blok) => {
    setRecordState((huidig) => {
      const nieuw = { id: nieuweId(), herhaling: null, ...blok };
      const bijgewerkt = nieuwRecord({ ...huidig, blokken: [...(huidig.blokken ?? []), nieuw] });
      schrijfLokaal('agenda_blokken', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const bewerk = useCallback((id, patch) => {
    setRecordState((huidig) => {
      const blokken = huidig.blokken.map((b) => (b.id === id ? { ...b, ...patch } : b));
      const bijgewerkt = nieuwRecord({ ...huidig, blokken });
      schrijfLokaal('agenda_blokken', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const verwijder = useCallback((id) => {
    setRecordState((huidig) => {
      const bijgewerkt = nieuwRecord({ ...huidig, blokken: huidig.blokken.filter((b) => b.id !== id) });
      schrijfLokaal('agenda_blokken', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  // Los van de blokken zelf bijgehouden, per (blokId, datum) — een blok met
  // herhaling: 'wekelijks' levert immers meerdere zichtbare instanties op
  // (zie lib/agenda/agendaBlokken.js instantiesInBereik) die allemaal
  // hetzelfde blok-record delen; "uitgevoerd" moet per week/instantie gelden,
  // niet voor alle weken tegelijk. Zelfde per-periode-log-patroon als
  // huishoud_taken_log (useHuishoudTaken.js).
  const toggleAfgerond = useCallback((blokId, datum) => {
    setRecordState((huidig) => {
      const log = { ...(huidig.log ?? {}) };
      const blokLog = { ...(log[blokId] ?? {}) };
      if (blokLog[datum]) delete blokLog[datum];
      else blokLog[datum] = true;
      log[blokId] = blokLog;
      const bijgewerkt = nieuwRecord({ ...huidig, log });
      schrijfLokaal('agenda_blokken', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  return { blokken: record.blokken ?? [], log: record.log ?? {}, voegToe, bewerk, verwijder, toggleAfgerond };
}
