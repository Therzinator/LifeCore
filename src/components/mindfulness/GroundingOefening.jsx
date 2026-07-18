import { useState } from 'react';
import { GROUNDING_VRAGEN } from '../../lib/mindfulness/grounding.js';
import OnderbouwingModal from '../ui/OnderbouwingModal.jsx';
import './GroundingOefening.css';

export default function GroundingOefening({ toonToast, onKlaar }) {
  const [actief, setActief] = useState(null);
  const [toonUitleg, setToonUitleg] = useState(false);

  function klaar() {
    toonToast?.('Grounding afgerond — je bent hier 🌿', 'ok');
    onKlaar();
  }

  return (
    <div>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>5-4-3-2-1 Grounding</div>
      <p className="of-stap-tekst">
        Kijk om je heen en beantwoord elke vraag. Geen goede of foute antwoorden. Neem de tijd.
      </p>

      <button className="ad-link" onClick={() => setToonUitleg(true)}>Waarom werkt dit?</button>

      <div className="go-lijst">
        {GROUNDING_VRAGEN.map((v) => (
          <button
            key={v.num}
            className={`go-kaart ${actief === v.num ? 'actief' : ''}`}
            onClick={() => setActief(actief === v.num ? null : v.num)}
          >
            <div className="go-num">{v.num}</div>
            <div className="go-vraag">{v.vraag}</div>
            <div className="go-hint">{v.hint}</div>
          </button>
        ))}
      </div>

      <div className="of-acties">
        <button className="btn btn-text" onClick={onKlaar}>Terug</button>
        <button className="btn btn-p btn-full" onClick={klaar}>Klaar — ik voel me verankerd</button>
      </div>

      {toonUitleg && <OnderbouwingModal sleutel="grounding54321" onClose={() => setToonUitleg(false)} />}
    </div>
  );
}
