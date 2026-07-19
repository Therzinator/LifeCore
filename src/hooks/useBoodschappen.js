import { useCallback, useEffect, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';
import { datumKey } from '../utils/datum.js';
import {
  haalItems, voegItemToe as voegItemToeGedeeld, werkItemBij, verwijderItem as verwijderItemGedeeld,
  abonneerOpItems, rijNaarItem,
} from '../lib/supabase/boodschappenGedeeld.js';
import {
  haalBeurten, logBoodschappenBeurt, abonneerOpBeurten,
} from '../lib/supabase/boodschappenBeurtenGedeeld.js';

function leegRecord() {
  return nieuwRecord({ items: [] });
}

function leegBeurtenRecord() {
  return nieuwRecord({ beurten: [] }); // [{ datum, items: [{tekst, aantal}] }]
}

function nieuweId() {
  return `bd_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// Logt lokaal een gekocht item als onderdeel van de 'boodschappen-beurt' van
// vandaag (per datum, één beurt per dag) — basis voor de zelflerende
// favorieten-detectie (zie boodschappenLeren.js). Puur lokale tegenhanger
// van logBoodschappenBeurt (Supabase-variant).
function logBeurtLokaal(huidig, tekst, aantal) {
  const vandaag = datumKey();
  const beurten = huidig.beurten ?? [];
  const bestaandeIndex = beurten.findIndex((b) => b.datum === vandaag);
  if (bestaandeIndex === -1) {
    return [...beurten, { datum: vandaag, items: [{ tekst, aantal }] }];
  }
  return beurten.map((b, i) => (i === bestaandeIndex ? { ...b, items: [...b.items, { tekst, aantal }] } : b));
}

// 'Zelflerend': een item verdwijnt niet als het gekocht is, het verhuist
// alleen van de actieve lijst (opLijst) naar de 'laatst gekocht'-catalogus
// (laatstGekochtOp gezet) — zo hoef je een vaak terugkerend boodschapje
// nooit opnieuw in te typen, alleen met één tik weer op de lijst te zetten.
// Elke keer dat een item wordt afgevinkt, wordt het ook gelogd in de
// boodschappen-beurt van vandaag (zie beurten hieronder) — daaruit leert
// detecteerFavorieten (boodschappenLeren.js) het wekelijks/maandelijks-
// patroon, i.p.v. dat je dat zelf handmatig instelt.
//
// huishoudenId === null: exact het oorspronkelijke gedrag (lokale blob).
// huishoudenId gezet: items/beurten leven in de gedeelde tabellen, live
// bijgehouden via Realtime.
export function useBoodschappen(huishoudenId = null, userId = null) {
  const [record, setRecordState] = useState(() => (
    huishoudenId ? leegRecord() : leesLokaal('boodschappen', leegRecord())
  ));
  const [beurtenRecord, setBeurtenRecordState] = useState(() => (
    huishoudenId ? leegBeurtenRecord() : leesLokaal('boodschappen_beurten', leegBeurtenRecord())
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

  useEffect(() => {
    if (!huishoudenId) return undefined;

    let actief = true;
    async function laad() {
      const beurten = await haalBeurten(huishoudenId);
      if (actief) setBeurtenRecordState(nieuwRecord({ beurten }));
    }
    laad();
    const stopAbonnement = abonneerOpBeurten(huishoudenId, laad);
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
      const item = record.items.find((i) => i.id === id);
      werkItemBij(id, { op_lijst: false, laatst_gekocht_op: new Date().toISOString(), laatst_gekocht_door: userId });
      if (item) logBoodschappenBeurt(huishoudenId, userId, item.tekst, item.aantal);
      return;
    }

    setRecordState((huidig) => {
      const item = (huidig.items ?? []).find((i) => i.id === id);
      const items = (huidig.items ?? []).map((i) => (
        i.id === id ? { ...i, opLijst: false, laatstGekochtOp: new Date().toISOString() } : i
      ));
      const bijgewerkt = nieuwRecord({ items });
      schrijfLokaal('boodschappen', bijgewerkt);

      if (item) {
        setBeurtenRecordState((huidigeBeurten) => {
          const bijgewerkteBeurten = nieuwRecord({ beurten: logBeurtLokaal(huidigeBeurten, item.tekst, item.aantal) });
          schrijfLokaal('boodschappen_beurten', bijgewerkteBeurten);
          return bijgewerkteBeurten;
        });
      }

      return bijgewerkt;
    });
  }, [huishoudenId, userId, record.items]);

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

  return {
    items: record.items ?? [],
    beurten: beurtenRecord.beurten ?? [],
    voegToe,
    zetAantal,
    toggleGekocht,
    heractiveren,
    hernoemItem,
    verwijder,
  };
}
