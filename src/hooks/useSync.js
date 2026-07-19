import { useCallback, useEffect, useRef, useState } from 'react';
import { synchroniseerAlles } from '../lib/supabase/sync.js';
import { LOKALE_WIJZIGING_EVENT } from '../lib/storage/lokaal.js';

// Stilte-periode voor de gedebouncede auto-sync na een lokale wijziging —
// lang genoeg om een reeks snelle klikken/toetsaanslagen (bv. losse
// stap-uren of subklusjes toevoegen in Kluslijst) als één cloud-round-trip
// te bundelen i.p.v. bij elke losse wijziging te syncen.
const DEBOUNCE_MS = 4000;

export function useSync(userId) {
  const [status, setStatus] = useState('lokaal');
  const bezigRef = useRef(false);
  const debounceRef = useRef(null);

  const syncNu = useCallback(async () => {
    if (!userId || bezigRef.current) return { ok: false, gewijzigd: false };
    bezigRef.current = true;
    setStatus('bezig');
    const { ok, gewijzigd } = await synchroniseerAlles(userId);
    setStatus(ok ? 'gelukt' : 'mislukt');
    bezigRef.current = false;
    return { ok, gewijzigd };
  }, [userId]);

  // Eenmalig ophalen bij inloggen/openen — pakt op wat op een ander
  // apparaat is opgeslagen. Een pull schrijft rechtstreeks in localStorage
  // (zie synchroniseerAlles), buiten React's state om, dus zonder herlaad
  // zou het huidige scherm de overgenomen cloud-data niet tonen.
  useEffect(() => {
    if (!userId) return;
    syncNu().then(({ gewijzigd }) => {
      if (gewijzigd) window.location.reload();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- alleen bij het verschijnen van een userId, niet bij elke syncNu-identiteitswijziging.
  }, [userId]);

  // Elke lokale wijziging in willekeurig welke module plant een sync na een
  // korte stilte-periode — de gebruiker hoeft nooit zelf op
  // 'Synchroniseren' te drukken.
  useEffect(() => {
    if (!userId) return undefined;
    function opWijziging() {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(syncNu, DEBOUNCE_MS);
    }
    window.addEventListener(LOKALE_WIJZIGING_EVENT, opWijziging);
    return () => {
      window.removeEventListener(LOKALE_WIJZIGING_EVENT, opWijziging);
      clearTimeout(debounceRef.current);
    };
  }, [userId, syncNu]);

  return { status, syncNu };
}
