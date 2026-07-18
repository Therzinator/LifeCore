import { useState } from 'react';
import { parseSpraakTekst } from '../../lib/werk/tekstParser.js';
import { werkLabels } from '../../lib/werk/labels.js';
import SpraakInvoer from './SpraakInvoer.jsx';
import './WerkTaken.css';

export default function WerkTaken({ werkTaken, toonToast, instellingen }) {
  const [invoer, setInvoer] = useState('');
  const [categorie, setCategorie] = useState(instellingen.categorieen[0] ?? null);
  const labels = werkLabels(instellingen.oldambtModus);
  const vandaagIsWerkdag = instellingen.werkdagen.includes(new Date().getDay() === 0 ? 7 : new Date().getDay());

  function takenToevoegen() {
    const teksten = parseSpraakTekst(invoer);
    if (teksten.length === 0) { toonToast('Geen taken gevonden in de tekst', 'wn'); return; }
    werkTaken.voegMeerdereToe(teksten, null, categorie);
    setInvoer('');
    toonToast(`${teksten.length} taak/taken toegevoegd`, 'ok');
  }

  return (
    <div>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>{labels.titel}</div>
      <p className="of-stap-tekst">Spreek je taken in aan het begin van de werkdag, of typ ze in.</p>
      {!vandaagIsWerkdag && <p className="ti-hint">Vandaag staat niet als werkdag ingesteld bij Instellingen.</p>}

      <div className="card">
        <SpraakInvoer waarde={invoer} onWaarde={setInvoer} placeholder={labels.placeholder} />
        {instellingen.categorieen.length > 0 && (
          <div className="ti-veld-grp" style={{ marginTop: 'var(--space-sm)' }}>
            <label className="ti-lbl" htmlFor="wt-categorie">Categorie</label>
            <select id="wt-categorie" className="ti-veld" value={categorie ?? ''} onChange={(e) => setCategorie(e.target.value || null)}>
              {instellingen.categorieen.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}
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
              <span className="wt-tekst">{t.tekst}{t.categorie ? <span className="wt-categorie"> · {t.categorie}</span> : null}</span>
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
