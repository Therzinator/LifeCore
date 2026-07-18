import { useState } from 'react';
import { SHUTDOWN_ITEMS, stemmingReactie } from '../../lib/adhd/afsluiten.js';
import SpraakKnop from '../ui/SpraakKnop.jsx';
import './AdhdAfsluiten.css';

const STEMMING_OPTIES = [
  { id: 'slecht', label: '😞' },
  { id: 'matig', label: '😕' },
  { id: 'ok', label: '😐' },
  { id: 'goed', label: '🙂' },
  { id: 'top', label: '😄' },
];

export default function AdhdAfsluiten({ adhdDag, toonToast }) {
  const [reflectie, setReflectieLokaal] = useState(adhdDag.dag.reflectie);
  const [morgenPrio, setMorgenPrioLokaal] = useState(adhdDag.dag.morgenPrio);

  const klaar = adhdDag.dag.taken.filter((t) => t.klaar).length;

  function afronden() {
    adhdDag.setReflectie(reflectie);
    adhdDag.setMorgenPrio(morgenPrio);
    adhdDag.setAfgerond();
    toonToast('Dag afgesloten — welverdiende rust 🌙', 'ok');
  }

  return (
    <div>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Afsluiten</div>
      <p className="of-stap-tekst">Een kort ritueel om je werkdag echt af te ronden.</p>

      <div className="td-grid">
        <div className="metric">
          <div className="ml">Focus</div>
          <div className="mv">{adhdDag.dag.focusMinuten} <span className="mu">min</span></div>
        </div>
        <div className="metric">
          <div className="ml">Afgerond</div>
          <div className="mv">{klaar}</div>
        </div>
        <div className="metric">
          <div className="ml">Pauzes</div>
          <div className="mv">{adhdDag.dag.pauzes}</div>
        </div>
      </div>

      <div className="card">
        <div className="td-label">Shutdown-checklist</div>
        {SHUTDOWN_ITEMS.map((tekst, idx) => (
          <button key={idx} className="aa-shutdown-item" onClick={() => adhdDag.vinkShutdown(idx)}>
            <span className={`aa-shutdown-box ${adhdDag.dag.shutdown[idx] ? 'gedaan' : ''}`}>
              {adhdDag.dag.shutdown[idx] ? '✓' : ''}
            </span>
            <span>{tekst}</span>
          </button>
        ))}
      </div>

      <div className="card">
        <div className="td-label">Hoe was je dag?</div>
        <div className="aa-stemming-rij">
          {STEMMING_OPTIES.map((o) => (
            <button
              key={o.id}
              className={`aa-stemming ${adhdDag.dag.stemming === o.id ? 'on' : ''}`}
              onClick={() => adhdDag.setStemming(o.id)}
            >
              {o.label}
            </button>
          ))}
        </div>
        {adhdDag.dag.stemming && <p className="aa-stemming-reactie">{stemmingReactie(adhdDag.dag.stemming)}</p>}
      </div>

      <div className="card">
        <label className="td-label" htmlFor="aa-reflectie">Reflectie</label>
        <div className="sk-inline-rij">
          <textarea
            id="aa-reflectie"
            className="aa-textarea"
            placeholder="Wat viel je op vandaag?"
            value={reflectie}
            onChange={(e) => setReflectieLokaal(e.target.value)}
          />
          <SpraakKnop waarde={reflectie} onWaarde={setReflectieLokaal} />
        </div>
        <label className="td-label" htmlFor="aa-morgen">Morgen als eerste</label>
        <div className="sk-inline-rij">
          <textarea
            id="aa-morgen"
            className="aa-textarea"
            placeholder="Eén prioriteit voor morgen..."
            value={morgenPrio}
            onChange={(e) => setMorgenPrioLokaal(e.target.value)}
          />
          <SpraakKnop waarde={morgenPrio} onWaarde={setMorgenPrioLokaal} />
        </div>
      </div>

      <div className="of-acties">
        <button className="btn btn-p btn-full" onClick={afronden}>Dag afsluiten</button>
      </div>
    </div>
  );
}
