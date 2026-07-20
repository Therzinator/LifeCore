import { useState } from 'react';
import { useAgendaBlokken } from '../../hooks/useAgendaBlokken.js';
import { useAgendaSignalen } from '../../hooks/useAgendaSignalen.js';
import { useDagTypeOverrides } from '../../hooks/useDagTypeOverrides.js';
import { useHuishoudProjecten } from '../../hooks/useHuishoudProjecten.js';
import { instantiesInBereik } from '../../lib/agenda/agendaBlokken.js';
import { TYPE_ICOON } from '../agenda/agendaWeergave.js';
import { datumKey } from '../../utils/datum.js';
import './VandaagOverzicht.css';

// Prominent bij het openen van de app zichtbaar (i.p.v. push-notificaties,
// zie docs/AGENDA.md §5, optie A) — zodat een dag met afspraken/blokken
// niet wegvalt bij hyperfocus, zonder de extra complexiteit van
// service-worker-push, VAPID-sleutels en een achtergrond-verstuurcomponent.
export default function VandaagOverzicht({ onOpenAgenda, huishoudenId }) {
  const [uitgeklapt, setUitgeklapt] = useState(false);
  const vandaag = datumKey();
  const blokken = useAgendaBlokken();
  const { overrides: dagTypeOverrides } = useDagTypeOverrides();
  const huishoudProjecten = useHuishoudProjecten(huishoudenId);
  const { signalen } = useAgendaSignalen(vandaag, vandaag, dagTypeOverrides, huishoudProjecten.projecten);
  const blokInstanties = instantiesInBereik(blokken.blokken, vandaag, vandaag);

  const items = [
    ...blokInstanties.map((b) => ({ id: `${b.id}-${b.datum}`, tekst: b.titel, type: b.type, tijd: b.starttijd })),
    ...signalen.map((s) => ({ id: s.id, tekst: s.tekst, type: s.type, tijd: null })),
  ].sort((a, b) => (a.tijd ?? '99:99').localeCompare(b.tijd ?? '99:99'));

  const getoond = uitgeklapt ? items : items.slice(0, 4);

  return (
    <div className="vo-wrap">
      <button type="button" className="vo-titel-knop" onClick={onOpenAgenda}>Vandaag</button>
      {items.length === 0 && <p className="vo-leeg">Niets gepland — rustige dag.</p>}
      {items.length > 0 && (
        <div className="vo-lijst">
          {getoond.map((item) => (
            <span key={item.id} className="vo-item">
              {item.tijd && <span className="vo-item-tijd">{item.tijd}</span>}
              <span>{TYPE_ICOON[item.type] ?? '•'} {item.tekst}</span>
            </span>
          ))}
          {items.length > 4 && (
            <button type="button" className="vo-meer" onClick={() => setUitgeklapt((v) => !v)}>
              {uitgeklapt ? 'Toon minder ▲' : `+${items.length - 4} meer ▼`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
