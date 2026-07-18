import { useState } from 'react';
import { filterSessies, lengteCategorie } from '../../lib/mindfulness/sessies.js';
import './SessieBrowser.css';

const THEMA_ICOON = { stress: '💆', focus: '🎯', slaap: '🌙', ochtendactivering: '☀️' };
const LENGTE_OPTIES = [
  { id: null, label: 'Alle lengtes' },
  { id: 'kort', label: 'Kort (2–5 min)' },
  { id: 'gemiddeld', label: 'Gemiddeld (10–15 min)' },
];

function duurLabel(seconden) {
  return `${Math.round(seconden / 60)} min`;
}

export default function SessieBrowser({ themas, sessies, laden, ingelogd, onKies }) {
  const [themaId, setThemaId] = useState(null);
  const [lengte, setLengte] = useState(null);

  if (!ingelogd) {
    return <p className="of-stap-tekst">Log in om toegang te krijgen tot de sessie-bibliotheek.</p>;
  }
  if (laden) {
    return <p className="of-stap-tekst">Sessies laden...</p>;
  }

  const gefilterd = filterSessies(sessies, { themaId, lengte });

  return (
    <div>
      <div className="sb-filter-rij">
        <button className={`sb-chip ${themaId === null ? 'on' : ''}`} onClick={() => setThemaId(null)}>Alle thema&apos;s</button>
        {themas.map((t) => (
          <button key={t.id} className={`sb-chip ${themaId === t.id ? 'on' : ''}`} onClick={() => setThemaId(t.id)}>
            {THEMA_ICOON[t.id] ?? ''} {t.titel}
          </button>
        ))}
      </div>
      <div className="sb-filter-rij">
        {LENGTE_OPTIES.map((o) => (
          <button key={o.id ?? 'alle'} className={`sb-chip ${lengte === o.id ? 'on' : ''}`} onClick={() => setLengte(o.id)}>
            {o.label}
          </button>
        ))}
      </div>

      {gefilterd.length === 0 && <p className="of-stap-tekst">Geen sessies gevonden met deze filters.</p>}

      <div className="sb-lijst">
        {gefilterd.map((s) => (
          <button className="sb-item" key={s.id} onClick={() => onKies(s)}>
            <span className="sb-item-icoon">{THEMA_ICOON[s.thema_id] ?? '🧘'}</span>
            <span className="sb-item-info">
              <span className="sb-item-titel">{s.titel}</span>
              <span className="sb-item-meta">{duurLabel(s.duur_seconden)} · {lengteCategorie(s.duur_seconden)}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
