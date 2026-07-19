import { useCallback, useEffect, useState } from 'react';
import { leesLokaal, schrijfLokaal, nieuwRecord } from '../lib/storage/lokaal.js';
import { maandagVan, dagIndexVan, datumKey } from '../utils/datum.js';
import { genereerWeekschema } from '../lib/werk/huishoudWeekschema.js';
import {
  haalWeekschemas, upsertWeekschema, verwijderOudeWeekschemas, abonneerOpWeekschema, rijNaarWeekschema,
} from '../lib/supabase/huishoudGedeeld.js';

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
//
// huishoudenId === null: exact het oorspronkelijke gedrag (lokale blob).
// huishoudenId gezet: schema's leven in de gedeelde huishoud_weekschema-
// tabel, live bijgehouden via Realtime.
export function useHuishoudWeekschema(huishoudenId = null) {
  const [record, setRecordState] = useState(() => (
    huishoudenId ? leegRecord() : leesLokaal('huishoud_weekschema', leegRecord())
  ));
  // Zie useHuishoudTaken.geladen — dezelfde reden: zorgVoorWeekschema mag pas
  // draaien nadat de echte schemas geladen zijn, anders upsert 'ie een lege
  // toewijzing over een al bestaand schema heen (zie zorgVoorWeekschema).
  const [geladen, setGeladen] = useState(!huishoudenId);

  useEffect(() => {
    if (!huishoudenId) return undefined;

    let actief = true;
    async function laad() {
      const rijen = await haalWeekschemas(huishoudenId);
      if (actief) {
        setRecordState(nieuwRecord({ schemas: rijen.map(rijNaarWeekschema) }));
        setGeladen(true);
      }
    }
    laad();
    const stopAbonnement = abonneerOpWeekschema(huishoudenId, laad);
    return () => { actief = false; stopAbonnement(); };
  }, [huishoudenId]);

  // Zorgt dat de lopende week een schema heeft (bootstrap: de eerste keer,
  // of een gemiste zondag, hoeft niet te wachten tot de volgende zondag) en
  // stelt op zondag alvast het schema voor de kómende week voor — apart
  // bewaard náást (niet in plaats van) het schema van de nog lopende week,
  // zodat 'vandaag' op zondag zelf nog naar het juiste, aflopende schema
  // kijkt. Ruimt weken op die al voorbij zijn.
  const zorgVoorWeekschema = useCallback((wekelijkseTaken) => {
    const vandaag = datumKey();
    const huidigeMaandag = maandagVan(vandaag);

    if (huishoudenId) {
      setRecordState((huidig) => {
        const schemas = huidig.schemas ?? [];

        if (!schemas.some((s) => s.weekMaandag === huidigeMaandag)) {
          upsertWeekschema(huishoudenId, huidigeMaandag, genereerWeekschema(wekelijkseTaken));
        }
        if (dagIndexVan(vandaag) === 6) {
          const nieuweMaandag = volgendeMaandag(vandaag);
          if (!schemas.some((s) => s.weekMaandag === nieuweMaandag)) {
            upsertWeekschema(huishoudenId, nieuweMaandag, genereerWeekschema(wekelijkseTaken));
          }
        }
        verwijderOudeWeekschemas(huishoudenId, huidigeMaandag);

        return huidig; // Realtime brengt de nieuwe/opgeschoonde staat terug.
      });
      return;
    }

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
  }, [huishoudenId]);

  const zetDag = useCallback((weekMaandag, taakId, dagIndex) => {
    if (huishoudenId) {
      setRecordState((huidig) => {
        const schema = (huidig.schemas ?? []).find((s) => s.weekMaandag === weekMaandag);
        const toewijzing = { ...(schema?.toewijzing ?? {}), [taakId]: dagIndex };
        upsertWeekschema(huishoudenId, weekMaandag, toewijzing);
        return huidig;
      });
      return;
    }

    setRecordState((huidig) => {
      const schemas = (huidig.schemas ?? []).map((s) => (
        s.weekMaandag === weekMaandag ? { ...s, toewijzing: { ...s.toewijzing, [taakId]: dagIndex } } : s
      ));
      const bijgewerkt = nieuwRecord({ schemas });
      schrijfLokaal('huishoud_weekschema', bijgewerkt);
      return bijgewerkt;
    });
  }, [huishoudenId]);

  const schemas = record.schemas ?? [];
  const vandaag = datumKey();
  const huidigSchema = schemas.find((s) => s.weekMaandag === maandagVan(vandaag)) ?? null;
  const volgendSchema = schemas.find((s) => s.weekMaandag === volgendeMaandag(vandaag)) ?? null;

  return { huidigSchema, volgendSchema, geladen, zorgVoorWeekschema, zetDag };
}
