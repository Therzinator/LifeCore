import { useCallback, useEffect, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';
import {
  haalGerechten, maakGerecht as maakGerechtGedeeld, verwijderGerecht as verwijderGerechtGedeeld,
  abonneerOpGerechten, rijNaarGerecht,
} from '../lib/supabase/gerechtenGedeeld.js';

function leegRecord() {
  return nieuwRecord({ gerechten: [] });
}

function nieuweId() {
  return `ger_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// Eigen gerechten (recepten) — naast de meegeleverde curated bibliotheek
// (zie lib/boodschappen/curatedeGerechten.js, geen onderdeel van deze hook:
// die is statisch en heeft geen opslag nodig). Zelfde dual-mode-patroon als
// de rest van Boodschappen: lokaal zonder huishouden, gedeeld + Realtime met.
export function useGerechten(huishoudenId = null, userId = null) {
  const [record, setRecordState] = useState(() => (
    huishoudenId ? leegRecord() : leesLokaal('gerechten', leegRecord())
  ));

  useEffect(() => {
    if (!huishoudenId) return undefined;

    let actief = true;
    async function laad() {
      const rijen = await haalGerechten(huishoudenId);
      if (actief) setRecordState(nieuwRecord({ gerechten: rijen.map(rijNaarGerecht) }));
    }
    laad();
    const stopAbonnement = abonneerOpGerechten(huishoudenId, laad);
    return () => { actief = false; stopAbonnement(); };
  }, [huishoudenId]);

  const maakGerecht = useCallback((gerecht) => {
    if (huishoudenId) {
      maakGerechtGedeeld(huishoudenId, userId, gerecht);
      return;
    }

    setRecordState((huidig) => {
      const nieuw = { id: nieuweId(), ...gerecht };
      const bijgewerkt = nieuwRecord({ gerechten: [...(huidig.gerechten ?? []), nieuw] });
      schrijfLokaal('gerechten', bijgewerkt);
      return bijgewerkt;
    });
  }, [huishoudenId, userId]);

  const verwijderGerecht = useCallback((id) => {
    if (huishoudenId) {
      verwijderGerechtGedeeld(id);
      return;
    }

    setRecordState((huidig) => {
      const bijgewerkt = nieuwRecord({ gerechten: (huidig.gerechten ?? []).filter((g) => g.id !== id) });
      schrijfLokaal('gerechten', bijgewerkt);
      return bijgewerkt;
    });
  }, [huishoudenId]);

  return { gerechten: record.gerechten ?? [], maakGerecht, verwijderGerecht };
}
