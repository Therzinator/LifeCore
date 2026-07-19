import { useState } from 'react';
import { parseSpraakTekst } from '../../lib/werk/tekstParser.js';
import SpraakInvoer from './SpraakInvoer.jsx';
import './HuishoudTaken.css';

const METHODEN = [
  { id: 'weggeefhoek', label: 'Weggeefhoek' },
  { id: 'marktplaats', label: 'Marktplaats' },
  { id: 'vuil', label: 'Vuil' },
];

export default function Ontspullen({ ontspullen, toonToast }) {
  const [invoer, setInvoer] = useState('');
  const [methode, setMethode] = useState('weggeefhoek');

  function toevoegen() {
    const teksten = parseSpraakTekst(invoer);
    if (teksten.length === 0) { toonToast('Geen spullen gevonden in de tekst', 'wn'); return; }
    teksten.forEach((tekst) => ontspullen.voegToe(tekst, methode));
    setInvoer('');
    toonToast(`${teksten.length} item(s) toegevoegd`, 'ok');
  }

  return (
    <div>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Ontspullen</div>
      <p className="of-stap-tekst">Spullen die het huis uit gaan — via de weggeefhoek, Marktplaats, of gewoon bij het vuil.</p>

      <div className="card">
        <SpraakInvoer waarde={invoer} onWaarde={setInvoer} placeholder="bijv. oude fiets, doos kabels, kinderstoel..." />
        <div className="hh-freq-rij">
          {METHODEN.map((m) => (
            <button
              key={m.id}
              className={`btn btn-sm ${methode === m.id ? 'btn-p' : 'btn-g'}`}
              onClick={() => setMethode(m.id)}
            >{m.label}</button>
          ))}
        </div>
        <button className="btn btn-p btn-full" style={{ marginTop: 'var(--space-sm)' }} onClick={toevoegen}>
          Toevoegen
        </button>
      </div>

      {METHODEN.map((m) => {
        const items = ontspullen.items.filter((i) => i.methode === m.id);
        return (
          <div className="card" key={m.id}>
            <div className="td-label">{m.label}</div>
            {items.length === 0 && <p className="of-stap-tekst">Niets hier.</p>}
            <div className="hh-lijst">
              {items.map((i) => (
                <div className="hh-item" key={i.id}>
                  <button className={`hh-check ${i.afgerond ? 'gedaan' : ''}`} onClick={() => ontspullen.toggle(i.id)}>
                    {i.afgerond ? '✓' : ''}
                  </button>
                  <span className={`hh-tekst ${i.afgerond ? 'gedaan' : ''}`}>{i.tekst}</span>
                  <button className="hh-verwijder" onClick={() => ontspullen.verwijder(i.id)}>✕</button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
