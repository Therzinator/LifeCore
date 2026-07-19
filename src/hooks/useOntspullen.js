import { useCallback, useEffect, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';
import {
  haalItems, voegItemToe as voegItemToeGedeeld, werkItemBij, verwijderItem as verwijderItemGedeeld,
  abonneerOpItems, rijNaarItem,
} from '../lib/supabase/ontspullenGedeeld.js';

function leegRecord() {
  return nieuwRecord({ items: [] });
}

function nieuweId() {
  return `os_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// Spullen die het huis uit gaan — via weggeefhoek, marktplaats, of gewoon
// bij het vuil. Elk item krijgt precies één methode (geen combinatie nodig:
// je kiest hoe iets weggaat, niet meerdere manieren tegelijk).
//
// huishoudenId === null: exact het oorspronkelijke gedrag (lokale blob).
// huishoudenId gezet: items leven in de gedeelde ontspullen_items-tabel,
// live bijgehouden via Realtime.
export function useOntspullen(huishoudenId = null, userId = null) {
  const [record, setRecordState] = useState(() => (
    huishoudenId ? leegRecord() : leesLokaal('ontspullen', leegRecord())
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

  const voegToe = useCallback((tekst, methode) => {
    if (huishoudenId) {
      voegItemToeGedeeld(huishoudenId, userId, tekst, methode);
      return;
    }

    setRecordState((huidig) => {
      const items = [...(huidig.items ?? []), { id: nieuweId(), tekst, methode, afgerond: false, afgerondOp: null }];
      const bijgewerkt = nieuwRecord({ items });
      schrijfLokaal('ontspullen', bijgewerkt);
      return bijgewerkt;
    });
  }, [huishoudenId, userId]);

  const toggle = useCallback((id) => {
    if (huishoudenId) {
      setRecordState((huidig) => {
        const item = (huidig.items ?? []).find((i) => i.id === id);
        if (item) {
          const afgerond = !item.afgerond;
          werkItemBij(id, { afgerond, afgerond_op: afgerond ? new Date().toISOString() : null });
        }
        return huidig;
      });
      return;
    }

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
  }, [huishoudenId]);

  const verwijder = useCallback((id) => {
    if (huishoudenId) {
      verwijderItemGedeeld(id);
      return;
    }

    setRecordState((huidig) => {
      const bijgewerkt = nieuwRecord({ items: (huidig.items ?? []).filter((i) => i.id !== id) });
      schrijfLokaal('ontspullen', bijgewerkt);
      return bijgewerkt;
    });
  }, [huishoudenId]);

  return { items: record.items ?? [], voegToe, toggle, verwijder };
}
