import { useCallback, useEffect, useMemo, useState } from 'react';
import { haalGebruik, logGebruik } from '../lib/supabase/mindfulness.js';
import { voortgangsStats } from '../lib/mindfulness/sessies.js';

export function useMindfulnessGebruik(userId) {
  const [records, setRecords] = useState([]);
  const [laden, setLaden] = useState(Boolean(userId));

  useEffect(() => {
    if (!userId) { setLaden(false); return undefined; }
    let actief = true;
    setLaden(true);
    haalGebruik(userId).then((data) => {
      if (!actief) return;
      setRecords(data);
      setLaden(false);
    });
    return () => { actief = false; };
  }, [userId]);

  const voegToe = useCallback(async (sessieId, geluisterdSeconden, voltooid) => {
    if (!userId || geluisterdSeconden < 1) return;
    const ok = await logGebruik(userId, sessieId, geluisterdSeconden, voltooid);
    if (ok) {
      setRecords((huidig) => [
        { gestart_op: new Date().toISOString(), geluisterd_seconden: geluisterdSeconden, voltooid, sessie_id: sessieId },
        ...huidig,
      ]);
    }
  }, [userId]);

  const stats = useMemo(() => voortgangsStats(records), [records]);

  return { records, laden, voegToe, stats };
}
