import { useState } from 'react';
import { parseSpraakTekst } from '../../lib/werk/tekstParser.js';
import { relatieveTijd } from '../../utils/datum.js';
import SpraakInvoer from './SpraakInvoer.jsx';
import BewerkbareTekst from '../ui/BewerkbareTekst.jsx';
import './HuishoudTaken.css';
import './Boodschappen.css';

export default function Boodschappen({ boodschappen, toonToast }) {
  const [invoer, setInvoer] = useState('');
  const [frequentie, setFrequentie] = useState('week');
  const [toonLaatstGekocht, setToonLaatstGekocht] = useState(false);

  const actief = boodschappen.items.filter((i) => i.opLijst);
  const laatstGekocht = boodschappen.items
    .filter((i) => !i.opLijst && i.laatstGekochtOp)
    .sort((a, b) => new Date(b.laatstGekochtOp) - new Date(a.laatstGekochtOp));

  function toevoegen() {
    const teksten = parseSpraakTekst(invoer);
    if (teksten.length === 0) { toonToast('Geen boodschappen gevonden in de tekst', 'wn'); return; }
    teksten.forEach((tekst) => boodschappen.voegToe(tekst, frequentie));
    setInvoer('');
    toonToast(`${teksten.length} item(s) toegevoegd`, 'ok');
  }

  return (
    <div>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Boodschappen</div>
      <p className="of-stap-tekst">
        Wekelijkse en maandelijkse boodschappen — eenmaal ingevoerd blijft een item onthouden, ook nadat je
        het hebt gekocht.
      </p>

      <div className="card">
        <SpraakInvoer waarde={invoer} onWaarde={setInvoer} placeholder="bijv. melk, brood, wc-papier..." />
        <div className="hh-freq-rij">
          <button className={`btn btn-sm ${frequentie === 'week' ? 'btn-p' : 'btn-g'}`} onClick={() => setFrequentie('week')}>Wekelijks</button>
          <button className={`btn btn-sm ${frequentie === 'maand' ? 'btn-p' : 'btn-g'}`} onClick={() => setFrequentie('maand')}>Maandelijks</button>
        </div>
        <button className="btn btn-p btn-full" style={{ marginTop: 'var(--space-sm)' }} onClick={toevoegen}>
          Toevoegen
        </button>
      </div>

      <div className="card">
        <div className="td-label">Boodschappenlijst ({actief.length})</div>
        {actief.length === 0 && <p className="of-stap-tekst">Niets op de lijst.</p>}
        <div className="hh-lijst">
          {actief.map((i) => (
            <div className="hh-item" key={i.id}>
              <button className="hh-check" onClick={() => boodschappen.toggleGekocht(i.id)} aria-label="Markeer als gekocht" title="Gekocht" />
              <span className="hh-tekst">
                <BewerkbareTekst waarde={i.tekst} onWijzig={(t) => boodschappen.hernoemItem(i.id, t)} label="Naam" />
                <span className="hhp-werk-badge"> · {i.frequentie === 'week' ? 'wekelijks' : 'maandelijks'}</span>
              </span>
              <div className="bd-aantal-ctrl">
                <button className="wt-mini-btn" onClick={() => boodschappen.zetAantal(i.id, i.aantal - 1)}>−</button>
                <span className="bd-aantal-val">{i.aantal}</span>
                <button className="wt-mini-btn" onClick={() => boodschappen.zetAantal(i.id, i.aantal + 1)}>+</button>
              </div>
              <button
                className="hh-verwijder"
                onClick={() => { if (window.confirm(`"${i.tekst}" verwijderen van de boodschappenlijst?`)) boodschappen.verwijder(i.id); }}
              >✕</button>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <button type="button" className="bd-inklap-knop" onClick={() => setToonLaatstGekocht((v) => !v)}>
          <span className="td-label" style={{ marginBottom: 0 }}>Laatst gekocht ({laatstGekocht.length})</span>
          <span aria-hidden="true">{toonLaatstGekocht ? '▲' : '▼'}</span>
        </button>
        {toonLaatstGekocht && (
          laatstGekocht.length === 0 ? (
            <p className="of-stap-tekst" style={{ marginTop: 'var(--space-sm)' }}>Nog niets afgevinkt.</p>
          ) : (
            <div className="hh-lijst" style={{ marginTop: 'var(--space-sm)' }}>
              {laatstGekocht.map((i) => (
                <div className="hh-item" key={i.id}>
                  <span className="hh-tekst">
                    <BewerkbareTekst waarde={i.tekst} onWijzig={(t) => boodschappen.hernoemItem(i.id, t)} label="Naam" />
                    <span className="hhp-werk-badge"> · {relatieveTijd(i.laatstGekochtOp)}</span>
                  </span>
                  <button className="btn btn-g btn-sm" onClick={() => boodschappen.heractiveren(i.id)}>+ Weer op lijst</button>
                  <button
                    className="hh-verwijder"
                    onClick={() => { if (window.confirm(`"${i.tekst}" definitief verwijderen (ook uit laatst gekocht)?`)) boodschappen.verwijder(i.id); }}
                  >✕</button>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
