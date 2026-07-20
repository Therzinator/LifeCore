import { useCallback, useEffect, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';
import { huidigePeriodeKey } from '../lib/werk/huishoudPeriode.js';
import {
  haalTaken, voegTakenToe as voegTakenToeGedeeld, verwijderTaak as verwijderTaakGedeeld,
  haalLog, toggleDezePeriode as toggleDezePeriodeGedeeld, abonneerOpTaken, rijNaarTaak, logRijenNaarMap,
} from '../lib/supabase/tuinGedeeld.js';

function leegRecord() {
  return nieuwRecord({ taken: [], log: {} });
}

function nieuweId() {
  return `tt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// Zelfde vorm/gedrag als useHuishoudTaken.js — terugkerende klussen met een
// frequentie (week/maand/aangepast) + een afvink-log per periode — maar dan
// voor tuinklussen, als eigen tabblad binnen Thuis naast Huishouden (zie
// ThuisPagina.jsx). Bewust geen weekschema/dag-toewijzing: daar is niet om
// gevraagd, en het is een apart stuk complexiteit los van de kern
// (terugkerende taak + afvinken).
export function useTuinTaken(huishoudenId = null, userId = null) {
  const [record, setRecordState] = useState(() => (
    huishoudenId ? leegRecord() : leesLokaal('tuin_taken', leegRecord())
  ));
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
      schrijfLokaal('tuin_taken', bijgewerkt);
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
      schrijfLokaal('tuin_taken', bijgewerkt);
      return bijgewerkt;
    });
  }, [huishoudenId, userId]);

  const verwijder = useCallback((id) => {
    if (huishoudenId) {
      verwijderTaakGedeeld(id);
      return;
    }

    setRecordState((huidig) => {
      const bijgewerkt = nieuwRecord({ ...huidig, taken: huidig.taken.filter((t) => t.id !== id) });
      schrijfLokaal('tuin_taken', bijgewerkt);
      return bijgewerkt;
    });
  }, [huishoudenId]);

  return { taken: record.taken ?? [], log: record.log ?? {}, geladen, voegMeerdereToe, toggleDezePeriode, verwijder };
}
