import { useCallback, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';

function leegRecord() {
  return nieuwRecord({ acties: [] });
}

function nieuweId() {
  return `ta_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// Toegewijde-actie-planner (ACT "committed action") — koppelt één waarde uit
// het kompas aan één concrete, tijdgebonden actie. Guilt-free: afronden is
// een simpele toggle, geen streak/schuldframing bij een gemiste actie, en
// geschiedenis blijft zichtbaar i.p.v. verwijderd te worden (zie
// verwijder() hieronder, die is voor een per-ongeluk aangemaakte actie —
// niet voor "ik heb 'm niet gehaald").
export function useToegewijdeActies() {
  const [record, setRecordState] = useState(() => leesLokaal('waarden_acties', leegRecord()));

  const voegToe = useCallback((domeinId, tekst) => {
    setRecordState((huidig) => {
      const nieuw = {
        id: nieuweId(), domeinId, tekst, afgerond: false, aangemaaktOp: new Date().toISOString(), afgerondOp: null,
      };
      const acties = [...(huidig.acties ?? []), nieuw];
      const bijgewerkt = nieuwRecord({ acties });
      schrijfLokaal('waarden_acties', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const toggleAfgerond = useCallback((id) => {
    setRecordState((huidig) => {
      const acties = huidig.acties.map((a) => {
        if (a.id !== id) return a;
        const afgerond = !a.afgerond;
        return { ...a, afgerond, afgerondOp: afgerond ? new Date().toISOString() : null };
      });
      const bijgewerkt = nieuwRecord({ acties });
      schrijfLokaal('waarden_acties', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const verwijder = useCallback((id) => {
    setRecordState((huidig) => {
      const bijgewerkt = nieuwRecord({ acties: huidig.acties.filter((a) => a.id !== id) });
      schrijfLokaal('waarden_acties', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const acties = record.acties ?? [];
  const openstaand = acties.filter((a) => !a.afgerond);
  const afgerondeActies = acties.filter((a) => a.afgerond);

  return { acties, openstaand, afgerondeActies, voegToe, toggleAfgerond, verwijder };
}
