import { useCallback, useEffect, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';
import {
  haalItems, voegItemToe as voegItemToeGedeeld, werkItemBij, verwijderItem as verwijderItemGedeeld,
  abonneerOpItems, rijNaarItem,
} from '../lib/supabase/boodschappenGedeeld.js';

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
//
// huishoudenId === null: exact het oorspronkelijke gedrag (lokale blob).
// huishoudenId gezet: items leven in de gedeelde boodschappen_items-tabel,
// live bijgehouden via Realtime.
export function useBoodschappen(huishoudenId = null, userId = null) {
  const [record, setRecordState] = useState(() => (
    huishoudenId ? leegRecord() : leesLokaal('boodschappen', leegRecord())
  ));

  useEffect(() => {
    if (!huishoudenId) return undefined;

    let actief = true;
    async function laad() {
      const rijen = await haalItems(huishoudenId);
      if (actief) setRecordState(nieuwRecord({ items: rijen.map(rijNaarItem) }));
    }
    laad();
    const stopAbonnement = abonneerOpItems(huishoudenId, laad);
    return () => { actief = false; stopAbonnement(); };
  }, [huishoudenId]);

  const voegToe = useCallback((tekst, frequentie) => {
    if (huishoudenId) {
      voegItemToeGedeeld(huishoudenId, tekst, frequentie);
      return;
    }

    setRecordState((huidig) => {
      const items = [
        ...(huidig.items ?? []),
        { id: nieuweId(), tekst, frequentie, aantal: 1, opLijst: true, laatstGekochtOp: null },
      ];
      const bijgewerkt = nieuwRecord({ items });
      schrijfLokaal('boodschappen', bijgewerkt);
      return bijgewerkt;
    });
  }, [huishoudenId]);

  const zetAantal = useCallback((id, aantal) => {
    if (huishoudenId) {
      werkItemBij(id, { aantal: Math.max(1, aantal) });
      return;
    }

    setRecordState((huidig) => {
      const items = (huidig.items ?? []).map((i) => (i.id === id ? { ...i, aantal: Math.max(1, aantal) } : i));
      const bijgewerkt = nieuwRecord({ items });
      schrijfLokaal('boodschappen', bijgewerkt);
      return bijgewerkt;
    });
  }, [huishoudenId]);

  const toggleGekocht = useCallback((id) => {
    if (huishoudenId) {
      werkItemBij(id, { op_lijst: false, laatst_gekocht_op: new Date().toISOString(), laatst_gekocht_door: userId });
      return;
    }

    setRecordState((huidig) => {
      const items = (huidig.items ?? []).map((i) => (
        i.id === id ? { ...i, opLijst: false, laatstGekochtOp: new Date().toISOString() } : i
      ));
      const bijgewerkt = nieuwRecord({ items });
      schrijfLokaal('boodschappen', bijgewerkt);
      return bijgewerkt;
    });
  }, [huishoudenId, userId]);

  const heractiveren = useCallback((id) => {
    if (huishoudenId) {
      werkItemBij(id, { op_lijst: true });
      return;
    }

    setRecordState((huidig) => {
      const items = (huidig.items ?? []).map((i) => (i.id === id ? { ...i, opLijst: true } : i));
      const bijgewerkt = nieuwRecord({ items });
      schrijfLokaal('boodschappen', bijgewerkt);
      return bijgewerkt;
    });
  }, [huishoudenId]);

  const hernoemItem = useCallback((id, tekst) => {
    if (huishoudenId) {
      werkItemBij(id, { tekst });
      return;
    }

    setRecordState((huidig) => {
      const items = (huidig.items ?? []).map((i) => (i.id === id ? { ...i, tekst } : i));
      const bijgewerkt = nieuwRecord({ items });
      schrijfLokaal('boodschappen', bijgewerkt);
      return bijgewerkt;
    });
  }, [huishoudenId]);

  const verwijder = useCallback((id) => {
    if (huishoudenId) {
      verwijderItemGedeeld(id);
      return;
    }

    setRecordState((huidig) => {
      const bijgewerkt = nieuwRecord({ items: (huidig.items ?? []).filter((i) => i.id !== id) });
      schrijfLokaal('boodschappen', bijgewerkt);
      return bijgewerkt;
    });
  }, [huishoudenId]);

  return { items: record.items ?? [], voegToe, zetAantal, toggleGekocht, heractiveren, hernoemItem, verwijder };
}
