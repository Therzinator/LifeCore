import { useState } from 'react';
import { URGE_STAPPEN } from '../../lib/mindfulness/urgeSurfing.js';
import OnderbouwingModal from '../ui/OnderbouwingModal.jsx';
import './UrgeSurfing.css';

export default function UrgeSurfing({ toonToast, onKlaar }) {
  const [stapIndex, setStapIndex] = useState(0);
  const [afgerond, setAfgerond] = useState(false);
  const [toonUitleg, setToonUitleg] = useState(false);

  const stap = URGE_STAPPEN[stapIndex];
  const laatsteStap = stapIndex === URGE_STAPPEN.length - 1;
  const pct = Math.round((stapIndex / URGE_STAPPEN.length) * 100);

  function volgende() {
    if (!laatsteStap) {
      setStapIndex((i) => i + 1);
      return;
    }
    setAfgerond(true);
    toonToast?.('Urge surfing voltooid 🌊', 'ok');
  }

  if (afgerond) {
    return (
      <div>
        <div className="us-klaar">
          <div className="us-klaar-icoon">🌊</div>
          <div className="us-klaar-titel">Klaar</div>
          <p className="of-stap-tekst">Je hebt de golf doorstaan. Elke keer dat je dit doet wordt het makkelijker.</p>
        </div>
        <div className="of-acties">
          <button className="btn btn-p btn-full" onClick={onKlaar}>Terug</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>🌊 Urge surfing</div>
      <p className="of-stap-tekst">Voor een drang — laat hem opkomen, pieken en vanzelf weer zakken.</p>
      <button className="ad-link" onClick={() => setToonUitleg(true)}>Waarom werkt dit?</button>

      <div className="us-voortgang-track"><div className="us-voortgang-fill" style={{ width: `${pct}%` }} /></div>

      <div className="us-kop">Stap {stapIndex + 1} van {URGE_STAPPEN.length} — {stap.fase}</div>
      <div className="us-instructie">{stap.instructie}</div>
      <div className="us-detail">{stap.detail}</div>

      <div className="of-acties">
        <button className="btn btn-text" onClick={onKlaar}>Stop</button>
        <button className="btn btn-p btn-full" onClick={volgende}>{laatsteStap ? 'Afronden ✓' : 'Volgende →'}</button>
      </div>

      {toonUitleg && <OnderbouwingModal sleutel="urgeSurfing" onClose={() => setToonUitleg(false)} />}
    </div>
  );
}
