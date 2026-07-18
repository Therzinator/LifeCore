import { useAgendaBlokken } from '../../hooks/useAgendaBlokken.js';
import { useAgendaSignalen } from '../../hooks/useAgendaSignalen.js';
import { instantiesInBereik } from '../../lib/agenda/agendaBlokken.js';
import { TYPE_ICOON } from '../agenda/agendaWeergave.js';
import './VandaagOverzicht.css';

function vandaagIso() {
  return new Date().toISOString().slice(0, 10);
}

// Prominent bij het openen van de app zichtbaar (i.p.v. push-notificaties,
// zie docs/AGENDA.md §5, optie A) — zodat een dag met afspraken/blokken
// niet wegvalt bij hyperfocus, zonder de extra complexiteit van
// service-worker-push, VAPID-sleutels en een achtergrond-verstuurcomponent.
export default function VandaagOverzicht({ onOpenAgenda }) {
  const vandaag = vandaagIso();
  const blokken = useAgendaBlokken();
  const { signalen } = useAgendaSignalen(vandaag, vandaag);
  const blokInstanties = instantiesInBereik(blokken.blokken, vandaag, vandaag);

  const items = [
    ...blokInstanties.map((b) => ({ id: `${b.id}-${b.datum}`, tekst: b.titel, type: b.type, tijd: b.starttijd })),
    ...signalen.map((s) => ({ id: s.id, tekst: s.tekst, type: s.type, tijd: null })),
  ].sort((a, b) => (a.tijd ?? '99:99').localeCompare(b.tijd ?? '99:99'));

  return (
    <button type="button" className="vo-wrap" onClick={onOpenAgenda}>
      <div className="vo-titel">Vandaag</div>
      {items.length === 0 && <p className="vo-leeg">Niets gepland — rustige dag.</p>}
      {items.length > 0 && (
        <div className="vo-lijst">
          {items.slice(0, 4).map((item) => (
            <span key={item.id} className="vo-item">
              {item.tijd && <span className="vo-item-tijd">{item.tijd}</span>}
              <span>{TYPE_ICOON[item.type] ?? '•'} {item.tekst}</span>
            </span>
          ))}
          {items.length > 4 && <span className="vo-meer">+{items.length - 4} meer</span>}
        </div>
      )}
    </button>
  );
}
