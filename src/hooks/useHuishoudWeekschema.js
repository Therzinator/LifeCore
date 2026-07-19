import { useCallback, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';
import { maandagVan, dagIndexVan, datumKey } from '../utils/datum.js';
import { genereerWeekschema } from '../lib/werk/huishoudWeekschema.js';

function leegRecord() {
  return nieuwRecord({ schemas: [] }); // [{ weekMaandag, toewijzing: {taakId: dagIndex} }]
}

function volgendeMaandag(vandaagIso) {
  const d = new Date(vandaagIso);
  d.setDate(d.getDate() + 1);
  return datumKey(d);
}

// Eén week-schema per week (niet per taak permanent) — zo blijft "welke dag
// deze week" losstaand van "welke dag normaal", en is elke week apart
// aanpasbaar zonder een terugkerend patroon te verstoren.
export function useHuishoudWeekschema() {
  const [record, setRecordState] = useState(() => leesLokaal('huishoud_weekschema', leegRecord()));

  // Zorgt dat de lopende week een schema heeft (bootstrap: de eerste keer,
  // of een gemiste zondag, hoeft niet te wachten tot de volgende zondag) en
  // stelt op zondag alvast het schema voor de kómende week voor — apart
  // bewaard náást (niet in plaats van) het schema van de nog lopende week,
  // zodat 'vandaag' op zondag zelf nog naar het juiste, aflopende schema
  // kijkt. Ruimt weken op die al voorbij zijn.
  const zorgVoorWeekschema = useCallback((wekelijkseTaken) => {
    const vandaag = datumKey();
    const huidigeMaandag = maandagVan(vandaag);

    setRecordState((huidig) => {
      let schemas = huidig.schemas ?? [];
      let gewijzigd = false;

      if (!schemas.some((s) => s.weekMaandag === huidigeMaandag)) {
        schemas = [...schemas, { weekMaandag: huidigeMaandag, toewijzing: genereerWeekschema(wekelijkseTaken) }];
        gewijzigd = true;
      }

      if (dagIndexVan(vandaag) === 6) {
        const nieuweMaandag = volgendeMaandag(vandaag);
        if (!schemas.some((s) => s.weekMaandag === nieuweMaandag)) {
          schemas = [...schemas, { weekMaandag: nieuweMaandag, toewijzing: genereerWeekschema(wekelijkseTaken) }];
          gewijzigd = true;
        }
      }

      const opgeschoond = schemas.filter((s) => s.weekMaandag >= huidigeMaandag);
      if (opgeschoond.length !== schemas.length) gewijzigd = true;

      if (!gewijzigd) return huidig;
      const bijgewerkt = nieuwRecord({ schemas: opgeschoond });
      schrijfLokaal('huishoud_weekschema', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const zetDag = useCallback((weekMaandag, taakId, dagIndex) => {
    setRecordState((huidig) => {
      const schemas = (huidig.schemas ?? []).map((s) => (
        s.weekMaandag === weekMaandag ? { ...s, toewijzing: { ...s.toewijzing, [taakId]: dagIndex } } : s
      ));
      const bijgewerkt = nieuwRecord({ schemas });
      schrijfLokaal('huishoud_weekschema', bijgewerkt);
      return bijgewerkt;
    });
  }, []);

  const schemas = record.schemas ?? [];
  const vandaag = datumKey();
  const huidigSchema = schemas.find((s) => s.weekMaandag === maandagVan(vandaag)) ?? null;
  const volgendSchema = schemas.find((s) => s.weekMaandag === volgendeMaandag(vandaag)) ?? null;

  return { huidigSchema, volgendSchema, zorgVoorWeekschema, zetDag };
}
