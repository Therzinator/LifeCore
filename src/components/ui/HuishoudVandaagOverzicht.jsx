import { useEffect } from 'react';
import { useHuishoudTaken } from '../../hooks/useHuishoudTaken.js';
import { useHuishoudWeekschema } from '../../hooks/useHuishoudWeekschema.js';
import { takenVoorDag } from '../../lib/werk/huishoudWeekschema.js';
import { huidigePeriodeKey } from '../../lib/werk/huishoudPeriode.js';
import { dagIndexVan, datumKey } from '../../utils/datum.js';
import './VandaagOverzicht.css';

// Zelfde plek/patroon als VandaagOverzicht (Agenda) — zichtbaar bij het
// openen van de app, zodat de huishoud-planning niet wegvalt tenzij je zelf
// naar Werk -> Huishouden navigeert. Bootstrapt/ververst hier ook het
// weekschema (zie useHuishoudWeekschema) — dit scherm is voor de meeste
// gebruikers het allereerste dat ze zien bij het openen van de app.
export default function HuishoudVandaagOverzicht({ onOpenWerk }) {
  const vandaag = datumKey();
  const huishoudTaken = useHuishoudTaken();
  const weekschema = useHuishoudWeekschema();
  const wekelijkseTaken = huishoudTaken.taken.filter((t) => t.frequentie === 'week');

  useEffect(() => {
    weekschema.zorgVoorWeekschema(wekelijkseTaken);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- alleen bij mount bootstrappen/verversen, zie useHuishoudWeekschema.
  }, []);

  const huidigeWeek = huidigePeriodeKey('week');
  const takenVandaag = weekschema.huidigSchema
    ? takenVoorDag(wekelijkseTaken, weekschema.huidigSchema.toewijzing, dagIndexVan(vandaag))
      .filter((t) => !huishoudTaken.log[t.id]?.[huidigeWeek])
    : [];
  const nieuwWeekschemaKlaar = dagIndexVan(vandaag) === 6 && Boolean(weekschema.volgendSchema);

  if (wekelijkseTaken.length === 0) return null;

  return (
    <button type="button" className="vo-wrap" onClick={onOpenWerk}>
      <div className="vo-titel">Huishouden vandaag</div>
      {takenVandaag.length === 0 && <p className="vo-leeg">Niets gepland vandaag.</p>}
      {takenVandaag.length > 0 && (
        <div className="vo-lijst">
          {takenVandaag.map((t) => (
            <span key={t.id} className="vo-item"><span>🧹 {t.tekst}</span></span>
          ))}
        </div>
      )}
      {nieuwWeekschemaKlaar && <p className="vo-meer">Weekschema voor volgende week klaar — bekijk &amp; pas aan.</p>}
    </button>
  );
}
