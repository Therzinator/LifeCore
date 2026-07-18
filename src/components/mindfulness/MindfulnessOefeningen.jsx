import { useState } from 'react';
import AdemMeditatie from './AdemMeditatie.jsx';
import GroundingOefening from './GroundingOefening.jsx';
import SpierontspanningOefening from './SpierontspanningOefening.jsx';
import UrgeSurfing from './UrgeSurfing.jsx';

const OEFENINGEN = [
  { id: 'meditatie', titel: 'Ademmeditatie', omschrijving: 'Rustig ademen, op je eigen tempo.' },
  { id: 'urge', titel: 'Urge surfing', omschrijving: 'Bij een drang — laat hem opkomen en zakken.' },
  { id: 'grounding', titel: '5-4-3-2-1 Grounding', omschrijving: 'Voor piekeren of overweldiging.' },
  { id: 'pmr', titel: 'Spierontspanning', omschrijving: 'Voor fysieke spanning in je lichaam.' },
];

export default function MindfulnessOefeningen({ toonToast }) {
  const [actief, setActief] = useState(null);

  if (actief === 'meditatie') return <AdemMeditatie onKlaar={() => setActief(null)} />;
  if (actief === 'urge') return <UrgeSurfing toonToast={toonToast} onKlaar={() => setActief(null)} />;
  if (actief === 'grounding') return <GroundingOefening toonToast={toonToast} onKlaar={() => setActief(null)} />;
  if (actief === 'pmr') return <SpierontspanningOefening onKlaar={() => setActief(null)} />;

  return (
    <div>
      {OEFENINGEN.map((o) => (
        <div className="card" key={o.id}>
          <div className="wp-titel">{o.titel}</div>
          <div className="wp-laatst">{o.omschrijving}</div>
          <button className="btn btn-p btn-full" onClick={() => setActief(o.id)}>Starten</button>
        </div>
      ))}
    </div>
  );
}
