import { useState } from 'react';
import SpraakKnop from '../ui/SpraakKnop.jsx';
import './StapDagfocus.css';

function Taaklijst({ label, items, setItems }) {
  const [invoer, setInvoer] = useState('');

  function voegToe() {
    const tekst = invoer.trim();
    if (!tekst) return;
    setItems([...items, tekst]);
    setInvoer('');
  }

  function verwijder(index) {
    setItems(items.filter((_, i) => i !== index));
  }

  return (
    <div className="df-zone">
      <div className="df-zone-lbl">{label}</div>
      {items.map((item, i) => (
        <div className="df-item" key={i}>
          <span>{item}</span>
          <button className="df-verwijder" onClick={() => verwijder(i)} aria-label="Verwijderen">✕</button>
        </div>
      ))}
      <div className="df-toevoegen">
        <input
          className="df-input"
          value={invoer}
          onChange={(e) => setInvoer(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && voegToe()}
          placeholder="Toevoegen..."
        />
        <SpraakKnop waarde={invoer} onWaarde={setInvoer} compact />
        <button className="btn btn-g btn-sm" onClick={voegToe}>+</button>
      </div>
    </div>
  );
}

export default function StapDagfocus({ dagdata, volgende, vorige, overslaan }) {
  const [hoofdprioriteit, setHoofdprioriteit] = useState(dagdata.dag.dagfocus?.hoofdprioriteit ?? '');
  const [moetVandaag, setMoetVandaag] = useState(dagdata.dag.dagfocus?.moetVandaag ?? []);
  const [kanLater, setKanLater] = useState(dagdata.dag.dagfocus?.kanLater ?? []);

  function ga() {
    dagdata.setDagfocus({ hoofdprioriteit, moetVandaag, kanLater });
    volgende();
  }

  return (
    <div>
      <div className="of-stap-titel">Wat telt vandaag?</div>
      <p className="of-stap-tekst">Eén belangrijkste ding. De rest mag wachten of later.</p>

      <div className="sk-inline-rij">
        <input
          className="df-hoofd"
          value={hoofdprioriteit}
          onChange={(e) => setHoofdprioriteit(e.target.value)}
          placeholder="Het belangrijkste ding vandaag..."
        />
        <SpraakKnop waarde={hoofdprioriteit} onWaarde={setHoofdprioriteit} compact />
      </div>

      <Taaklijst label="Moet vandaag" items={moetVandaag} setItems={setMoetVandaag} />
      <Taaklijst label="Kan later" items={kanLater} setItems={setKanLater} />

      <div className="of-acties">
        <button className="btn btn-text" onClick={vorige}>Terug</button>
        <button className="btn btn-text" onClick={overslaan}>Overslaan</button>
        <button className="btn btn-p btn-full" onClick={ga}>Verder</button>
      </div>
    </div>
  );
}
