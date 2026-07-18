import { useState } from 'react';
import { WAARDEN, waardeById } from '../../lib/act/waarden.js';
import OnderbouwingModal from '../ui/OnderbouwingModal.jsx';
import './WaardenVerheldering.css';

export default function WaardenVerheldering({ profiel, setKernwaarden }) {
  const [toonUitleg, setToonUitleg] = useState(false);
  const gekozen = profiel.kernwaarden ?? [];

  function toggle(id) {
    const nieuw = gekozen.includes(id) ? gekozen.filter((w) => w !== id) : [...gekozen, id];
    setKernwaarden(nieuw);
  }

  return (
    <div>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Mijn waarden</div>
      <p className="of-stap-tekst">
        Kies de waarden die op dit moment belangrijk voor je zijn. Geen goed aantal — je kunt dit
        altijd aanpassen.
      </p>

      <button className="ad-link" onClick={() => setToonUitleg(true)}>Waarom werkt dit?</button>

      <div className="wv-grid">
        {WAARDEN.map((w) => (
          <button
            key={w.id}
            className={`wv-chip ${gekozen.includes(w.id) ? 'on' : ''}`}
            onClick={() => toggle(w.id)}
          >
            {w.label}
          </button>
        ))}
      </div>

      {gekozen.length > 0 && (
        <div className="wv-omschrijvingen">
          {gekozen.map((id) => {
            const w = waardeById(id);
            if (!w) return null;
            return (
              <div className="wv-omschrijving-item" key={id}>
                <strong>{w.label}</strong> — {w.omschrijving}
              </div>
            );
          })}
        </div>
      )}

      {toonUitleg && <OnderbouwingModal sleutel="waardenACT" onClose={() => setToonUitleg(false)} />}
    </div>
  );
}
