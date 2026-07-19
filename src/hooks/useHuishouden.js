import { useCallback, useEffect, useState } from 'react';
import {
  haalMijnHuishouden, maakHuishouden, maakUitnodiging, haalUitnodigingenVoorHuishouden,
  trekUitnodigingIn, verwijderLid,
} from '../lib/supabase/huishoudens.js';

// Eén huishouden per gebruiker (v1, zie migratie 0003_huishoudens.sql).
// 'Huishouden verlaten' heeft geen eigen actie — de UI roept verwijderLid
// aan op je eigen lidmaatschap-rij-id (RLS staat dat toe, zie migratie).
export function useHuishouden(userId, email) {
  const [huishouden, setHuishouden] = useState(null);
  const [uitnodigingen, setUitnodigingen] = useState([]);
  const [laden, setLaden] = useState(true);

  const ververs = useCallback(async () => {
    if (!userId) { setLaden(false); return; }
    setLaden(true);
    const h = await haalMijnHuishouden();
    setHuishouden(h);
    setUitnodigingen(h ? await haalUitnodigingenVoorHuishouden(h.id) : []);
    setLaden(false);
  }, [userId]);

  useEffect(() => { ververs(); }, [ververs]);

  const maakAan = useCallback(async (naam) => {
    if (!userId) return;
    await maakHuishouden(userId, email, naam);
    await ververs();
  }, [userId, email, ververs]);

  const nodigUit = useCallback(async (uitgenodigdEmail) => {
    if (!huishouden || !userId) return null;
    const uitnodiging = await maakUitnodiging(huishouden.id, userId, uitgenodigdEmail);
    await ververs();
    return uitnodiging;
  }, [huishouden, userId, ververs]);

  const trekIn = useCallback(async (id) => {
    await trekUitnodigingIn(id);
    await ververs();
  }, [ververs]);

  const verwijder = useCallback(async (lidId) => {
    await verwijderLid(lidId);
    await ververs();
  }, [ververs]);

  return {
    huishouden,
    leden: huishouden?.huishouden_leden ?? [],
    uitnodigingen,
    laden,
    maakAan,
    nodigUit,
    trekIn,
    verwijderLid: verwijder,
    ververs,
  };
}
