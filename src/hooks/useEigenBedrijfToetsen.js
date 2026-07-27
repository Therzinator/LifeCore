import { useCallback, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';

// Zondag-toetsmoment-antwoorden, één record per week (sleutel = maandagVan-
// datum), zelfde map-per-datum-vorm als useCardioChecklist.js. Elk record is
// een SNAPSHOT (gelogd/gepland op het moment van beantwoorden) — als het
// schema later verandert, mag een oude week niet retroactief anders
// beoordeeld worden. Records worden nooit verwijderd bij een overschreden
// week (guilt-free-principe: geschiedenis blijft altijd zichtbaar).
function leegRecord() {
  return nieuwRecord({ weken: {} });
}

export function useEigenBedrijfToetsen() {
  const [record, setRecordState] = useState(() => leesLokaal('eigenbedrijf_toetsen', leegRecord()));

  const bewaarToets = useCallback((weekMaandag, data) => {
    setRecordState((huidig) => {
      const weken = { ...huidig.weken, [weekMaandag]: { ...data, gelogdOp: Date.now() } };
      const bijgewerkt = nieuwRecord({ weken });
      schrijfLokaal('eigenbedrijf_toetsen', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  return { weken: record.weken ?? {}, bewaarToets };
}
