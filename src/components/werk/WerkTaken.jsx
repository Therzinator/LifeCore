import { useState } from 'react';
import { parseSpraakTekst } from '../../lib/werk/tekstParser.js';
import SpraakInvoer from './SpraakInvoer.jsx';
import './WerkTaken.css';

export default function WerkTaken({ werkTaken, toonToast }) {
  const [invoer, setInvoer] = useState('');

  function takenToevoegen() {
    const teksten = parseSpraakTekst(invoer);
    if (teksten.length === 0) { toonToast('Geen taken gevonden in de tekst', 'wn'); return; }
    werkTaken.voegMeerdereToe(teksten);
    setInvoer('');
    toonToast(`${teksten.length} taak/taken toegevoegd`, 'ok');
  }

  return (
    <div>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Werktaken</div>
      <p className="of-stap-tekst">Spreek je taken in aan het begin van de werkdag, of typ ze in.</p>

      <div className="card">
        <SpraakInvoer waarde={invoer} onWaarde={setInvoer} placeholder="bijv. mail beantwoorden, vergadering voorbereiden..." />
        <button className="btn btn-p btn-full" style={{ marginTop: 'var(--space-sm)' }} onClick={takenToevoegen}>
          Taken toevoegen
        </button>
      </div>

      <div className="card">
        <div className="td-label">Openstaand ({werkTaken.openstaand.length})</div>
        {werkTaken.openstaand.length === 0 && <p className="of-stap-tekst">Niets openstaand — goed bezig.</p>}
        <div className="wt-lijst">
          {werkTaken.openstaand.map((t) => (
            <div className="wt-item" key={t.id}>
              <button className="wt-check" onClick={() => werkTaken.toggleKlaar(t.id)} aria-label="Markeer als afgerond">○</button>
              <span className="wt-tekst">{t.tekst}</span>
              <div className="wt-focus-ctrl">
                <button className="wt-mini-btn" onClick={() => werkTaken.zetFocusMinuten(t.id, Math.max(0, (t.focusMinuten || 0) - 15))}>−</button>
                <span className="wt-focus-val">{t.focusMinuten ? `${t.focusMinuten}m` : '—'}</span>
                <button className="wt-mini-btn" onClick={() => werkTaken.zetFocusMinuten(t.id, (t.focusMinuten || 0) + 15)}>+</button>
              </div>
              <button className="wt-verwijder" onClick={() => werkTaken.verwijder(t.id)}>✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
