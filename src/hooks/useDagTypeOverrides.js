import { useCallback, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';

function leegRecord() {
  return nieuwRecord({ overrides: {} });
}

// Per-datum overschrijving van het vaste wekelijkse werkdagen-patroon
// (Werk-instellingen) — voor de uitzondering: een specifieke zaterdag die
// toch een werkdag is, of een specifieke doordeweekse dag die vrij is.
// Gedeeld tussen Agenda (waar je 'm instelt) en Focus (die 'm afleest).
export function useDagTypeOverrides() {
  const [record, setRecordState] = useState(() => leesLokaal('dag_type_overrides', leegRecord()));

  const zetOverride = useCallback((datum, type) => {
    setRecordState((huidig) => {
      const overrides = { ...huidig.overrides };
      if (type) overrides[datum] = type; else delete overrides[datum];
      const bijgewerkt = nieuwRecord({ overrides });
      schrijfLokaal('dag_type_overrides', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  return { overrides: record.overrides ?? {}, zetOverride };
}
