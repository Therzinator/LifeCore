import { useState } from 'react';

// Losse checklist per Kluslijst-PROJECT (niet per klusje) voor bv.
// bouwmarkt-materiaal en zaagmaten — vrije tekst per regel (zelfde
// eenvoud als de stappen-checklist bij een klusje) i.p.v. aparte
// naam/afmeting-velden, dus "plank 120x18cm zagen" is één regel.
export default function WerkvoorbereidingLijst({ projectId, items, onToevoegen, onToggle, onVerwijderen }) {
  const [tekst, setTekst] = useState('');

  function voegToe() {
    if (!tekst.trim()) return;
    onToevoegen(projectId, tekst.trim());
    setTekst('');
  }

  return (
    <div className="card hhp-werkvoorbereiding">
      <div className="td-label">Werkvoorbereiding</div>
      <p className="ti-hint">Materiaal, zaagmaten en wat je verder klaar moet hebben — vink af zodra het geregeld is.</p>
      {items.length === 0 && <p className="of-stap-tekst">Nog niets toegevoegd.</p>}
      <div className="hh-lijst">
        {items.map((item) => (
          <div className="hh-item" key={item.id}>
            <button className={`hh-check ${item.afgerond ? 'gedaan' : ''}`} onClick={() => onToggle(projectId, item.id)}>
              {item.afgerond ? '✓' : ''}
            </button>
            <span className={`hh-tekst ${item.afgerond ? 'gedaan' : ''}`}>{item.tekst}</span>
            <button className="hh-verwijder" onClick={() => onVerwijderen(projectId, item.id)}>✕</button>
          </div>
        ))}
      </div>
      <div className="hhp-stap-invoer">
        <input
          className="ti-veld"
          value={tekst}
          onChange={(e) => setTekst(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); voegToe(); } }}
          placeholder="bijv. 2 planken 120x18cm, 8x schroef 4x40mm..."
        />
        <button type="button" className="btn btn-g btn-sm" onClick={voegToe} disabled={!tekst.trim()}>+ Toevoegen</button>
      </div>
    </div>
  );
}
