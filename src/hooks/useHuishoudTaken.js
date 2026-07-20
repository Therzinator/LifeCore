import { useCallback, useEffect, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';
import { huidigePeriodeKey } from '../lib/werk/huishoudPeriode.js';
import {
  haalTaken, voegTakenToe as voegTakenToeGedeeld, verwijderTaak as verwijderTaakGedeeld, pasUrenAan as pasUrenAanGedeeld,
  haalLog, toggleDezePeriode as toggleDezePeriodeGedeeld, abonneerOpTaken, rijNaarTaak, logRijenNaarMap,
} from '../lib/supabase/huishoudGedeeld.js';

function leegRecord() {
  return nieuwRecord({ taken: [], log: {} });
}

function nieuweId() {
  return `ht_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// Log is per taak-id een map van periodeKey -> voltooid, dus geschiedenis
// van eerdere weken/maanden blijft altijd staan (nooit overschreven) — een
// gemiste periode wordt gewoon niet gezet, niet als "mislukt" gemarkeerd.
//
// huishoudenId === null: exact het oorspronkelijke gedrag (lokale blob).
// huishoudenId gezet: taken + log leven in de gedeelde tabellen, live
// bijgehouden via Realtime.
export function useHuishoudTaken(huishoudenId = null, userId = null) {
  const [record, setRecordState] = useState(() => (
    huishoudenId ? leegRecord() : leesLokaal('huishoud_taken', leegRecord())
  ));
  // Lokaal (huishoudenId === null) is de state synchroon uit localStorage
  // gelezen, dus meteen 'geladen'. Gedeeld moet wachten op de eerste
  // Supabase-fetch — zie geladen hieronder waarom dat cruciaal is.
  const [geladen, setGeladen] = useState(!huishoudenId);

  useEffect(() => {
    if (!huishoudenId) return undefined;

    let actief = true;
    async function laad() {
      const taken = await haalTaken(huishoudenId);
      const log = await haalLog(taken.map((t) => t.id));
      if (actief) {
        setRecordState(nieuwRecord({ taken: taken.map(rijNaarTaak), log: logRijenNaarMap(log) }));
        setGeladen(true);
      }
    }
    laad();
    const stopAbonnement = abonneerOpTaken(huishoudenId, laad);
    return () => { actief = false; stopAbonnement(); };
  }, [huishoudenId]);

  const voegMeerdereToe = useCallback((teksten, frequentie, intervalDagen = null, geschatteUren = 0.5) => {
    if (huishoudenId) {
      voegTakenToeGedeeld(teksten.map((tekst) => ({
        huishouden_id: huishoudenId, tekst, frequentie, interval_dagen: frequentie === 'aangepast' ? intervalDagen : null,
        geschatte_uren: geschatteUren,
      })));
      return;
    }

    setRecordState((huidig) => {
      const nieuwe = teksten.map((tekst) => ({
        id: nieuweId(), tekst, frequentie, intervalDagen: frequentie === 'aangepast' ? intervalDagen : null, geschatteUren,
      }));
      const bijgewerkt = nieuwRecord({ ...huidig, taken: [...(huidig.taken ?? []), ...nieuwe] });
      schrijfLokaal('huishoud_taken', bijgewerkt);
      return bijgewerkt;
    });
  }, [huishoudenId]);

  const toggleDezePeriode = useCallback((taakId, frequentie, intervalDagen = null) => {
    const periode = huidigePeriodeKey(frequentie, new Date(), intervalDagen);

    if (huishoudenId) {
      toggleDezePeriodeGedeeld(taakId, periode, userId);
      return;
    }

    setRecordState((huidig) => {
      const log = { ...(huidig.log ?? {}) };
      const taakLog = { ...(log[taakId] ?? {}) };
      taakLog[periode] = !taakLog[periode];
      log[taakId] = taakLog;
      const bijgewerkt = nieuwRecord({ ...huidig, log });
      schrijfLokaal('huishoud_taken', bijgewerkt);
      return bijgewerkt;
    });
  }, [huishoudenId, userId]);

  const pasUrenAan = useCallback((id, geschatteUren) => {
    if (huishoudenId) {
      pasUrenAanGedeeld(id, geschatteUren);
      return;
    }

    setRecordState((huidig) => {
      const taken = huidig.taken.map((t) => (t.id === id ? { ...t, geschatteUren } : t));
      const bijgewerkt = nieuwRecord({ ...huidig, taken });
      schrijfLokaal('huishoud_taken', bijgewerkt);
      return bijgewerkt;
    });
  }, [huishoudenId]);

  const verwijder = useCallback((id) => {
    if (huishoudenId) {
      verwijderTaakGedeeld(id);
      return;
    }

    setRecordState((huidig) => {
      const bijgewerkt = nieuwRecord({ ...huidig, taken: huidig.taken.filter((t) => t.id !== id) });
      schrijfLokaal('huishoud_taken', bijgewerkt);
      return bijgewerkt;
    });
  }, [huishoudenId]);

  return { taken: record.taken ?? [], log: record.log ?? {}, geladen, voegMeerdereToe, toggleDezePeriode, pasUrenAan, verwijder };
}
