import { useState } from 'react';
import AdemMeditatie from './AdemMeditatie.jsx';
import GroundingOefening from './GroundingOefening.jsx';
import SpierontspanningOefening from './SpierontspanningOefening.jsx';
import UrgeSurfing from './UrgeSurfing.jsx';

const SESSIES = [
  { id: 'meditatie', titel: 'Ademmeditatie', omschrijving: 'Rustig ademen, op je eigen tempo.' },
  { id: 'urge', titel: 'Urge surfing', omschrijving: 'Bij een drang — laat hem opkomen en zakken.' },
  { id: 'grounding', titel: '5-4-3-2-1 Grounding', omschrijving: 'Voor piekeren of overweldiging.' },
  { id: 'pmr', titel: 'Spierontspanning', omschrijving: 'Voor fysieke spanning in je lichaam.' },
];

export default function MindfulnessPagina({ toonToast }) {
  const [actief, setActief] = useState(null);

  if (actief === 'meditatie') {
    return (
      <div className="of-wrap">
        <div className="card">
          <AdemMeditatie onKlaar={() => setActief(null)} />
        </div>
      </div>
    );
  }

  if (actief === 'urge') {
    return (
      <div className="of-wrap">
        <div className="card">
          <UrgeSurfing toonToast={toonToast} onKlaar={() => setActief(null)} />
        </div>
      </div>
    );
  }

  if (actief === 'grounding') {
    return (
      <div className="of-wrap">
        <div className="card">
          <GroundingOefening toonToast={toonToast} onKlaar={() => setActief(null)} />
        </div>
      </div>
    );
  }

  if (actief === 'pmr') {
    return (
      <div className="of-wrap">
        <div className="card">
          <SpierontspanningOefening onKlaar={() => setActief(null)} />
        </div>
      </div>
    );
  }

  return (
    <div className="of-wrap">
      {SESSIES.map((s) => (
        <div className="card" key={s.id}>
          <div className="wp-titel">{s.titel}</div>
          <div className="wp-laatst">{s.omschrijving}</div>
          <button className="btn btn-p btn-full" onClick={() => setActief(s.id)}>Starten</button>
        </div>
      ))}
    </div>
  );
}
