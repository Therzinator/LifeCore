import { useCallback, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';
import { huidigePeriodeKey } from '../lib/werk/huishoudPeriode.js';

function leegRecord() {
  return nieuwRecord({ taken: [], log: {} });
}

function nieuweId() {
  return `ht_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// Log is per taak-id een map van periodeKey -> voltooid, dus geschiedenis
// van eerdere weken/maanden blijft altijd staan (nooit overschreven) — een
// gemiste periode wordt gewoon niet gezet, niet als "mislukt" gemarkeerd.
export function useHuishoudTaken() {
  const [record, setRecordState] = useState(() => leesLokaal('huishoud_taken', leegRecord()));

  const voegMeerdereToe = useCallback((teksten, frequentie) => {
    setRecordState((huidig) => {
      const nieuwe = teksten.map((tekst) => ({ id: nieuweId(), tekst, frequentie }));
      const bijgewerkt = nieuwRecord({ ...huidig, taken: [...(huidig.taken ?? []), ...nieuwe] });
      schrijfLokaal('huishoud_taken', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const toggleDezePeriode = useCallback((taakId, frequentie) => {
    setRecordState((huidig) => {
      const periode = huidigePeriodeKey(frequentie);
      const log = { ...(huidig.log ?? {}) };
      const taakLog = { ...(log[taakId] ?? {}) };
      taakLog[periode] = !taakLog[periode];
      log[taakId] = taakLog;
      const bijgewerkt = nieuwRecord({ ...huidig, log });
      schrijfLokaal('huishoud_taken', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const verwijder = useCallback((id) => {
    setRecordState((huidig) => {
      const bijgewerkt = nieuwRecord({ ...huidig, taken: huidig.taken.filter((t) => t.id !== id) });
      schrijfLokaal('huishoud_taken', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  return { taken: record.taken ?? [], log: record.log ?? {}, voegMeerdereToe, toggleDezePeriode, verwijder };
}
