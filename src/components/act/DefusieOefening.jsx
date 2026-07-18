import { useState } from 'react';
import { defusieStappen } from '../../lib/act/defusie.js';
import OnderbouwingModal from '../ui/OnderbouwingModal.jsx';
import './DefusieOefening.css';

export default function DefusieOefening() {
  const [gedachte, setGedachte] = useState('');
  const [stappen, setStappen] = useState([]);
  const [stapIndex, setStapIndex] = useState(0);
  const [toonUitleg, setToonUitleg] = useState(false);

  function begin() {
    const berekend = defusieStappen(gedachte);
    if (berekend.length === 0) return;
    setStappen(berekend);
    setStapIndex(0);
  }

  function opnieuw() {
    setStappen([]);
    setGedachte('');
  }

  return (
    <div>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>
        Even afstand nemen
      </div>
      <p className="of-stap-tekst">
        Schrijf een gedachte op die veel ruimte inneemt. We bekijken hem samen van een stapje afstand.
      </p>

      <button className="ad-link" onClick={() => setToonUitleg(true)}>Waarom werkt dit?</button>

      {stappen.length === 0 && (
        <>
          <textarea
            className="do-input"
            value={gedachte}
            onChange={(e) => setGedachte(e.target.value)}
            placeholder="Bijvoorbeeld: ik ga dit niet redden..."
          />
          <button className="btn btn-p btn-full" onClick={begin} disabled={!gedachte.trim()}>
            Bekijk het van een afstand
          </button>
        </>
      )}

      {stappen.length > 0 && (
        <>
          <div className="do-stappen">
            {stappen.slice(0, stapIndex + 1).map((stap, i) => (
              <div className="do-stap" key={i}>
                <div className="do-stap-lbl">{stap.label}</div>
                <div className="do-stap-tekst">{stap.tekst}</div>
              </div>
            ))}
          </div>

          <div className="of-acties">
            {stapIndex < stappen.length - 1 && (
              <button className="btn btn-p btn-full" onClick={() => setStapIndex((i) => i + 1)}>
                Nog een stap terug
              </button>
            )}
            {stapIndex === stappen.length - 1 && (
              <button className="btn btn-g btn-full" onClick={opnieuw}>
                Opnieuw
              </button>
            )}
          </div>
        </>
      )}

      {toonUitleg && <OnderbouwingModal sleutel="defusieACT" onClose={() => setToonUitleg(false)} />}
    </div>
  );
}
