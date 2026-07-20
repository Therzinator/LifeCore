import { useState } from 'react';
import { parseSpraakTekst } from '../../lib/werk/tekstParser.js';
import { percentageAfgerond, huidigePeriodeKey } from '../../lib/werk/huishoudPeriode.js';
import SpraakInvoer from '../werk/SpraakInvoer.jsx';
// Hergebruikt de hh-*/td-*-klassen van HuishoudTaken.css — zelfde terugkerende-
// checklist-vorm, geen aparte styling nodig voor een tweede lijst.
import '../werk/HuishoudTaken.css';

export default function TuinTaken({ tuinTaken, toonToast }) {
  const [invoer, setInvoer] = useState('');
  const [frequentie, setFrequentie] = useState('week');
  const [intervalDagen, setIntervalDagen] = useState(10);
  const [geschatteUren, setGeschatteUren] = useState(0.5);

  const aangepasteTaken = tuinTaken.taken.filter((t) => t.frequentie === 'aangepast');

  function takenToevoegen() {
    const teksten = parseSpraakTekst(invoer);
    if (teksten.length === 0) { toonToast('Geen klussen gevonden in de tekst', 'wn'); return; }
    tuinTaken.voegMeerdereToe(teksten, frequentie, intervalDagen, geschatteUren);
    setInvoer('');
    toonToast(`${teksten.length} tuinklus/tuinklussen toegevoegd`, 'ok');
  }

  const weekStats = percentageAfgerond(tuinTaken.taken, tuinTaken.log, 'week');
  const maandStats = percentageAfgerond(tuinTaken.taken, tuinTaken.log, 'maand');
  const huidigeWeek = huidigePeriodeKey('week');
  const huidigeMaand = huidigePeriodeKey('maand');

  return (
    <div>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Tuinieren</div>
      <p className="of-stap-tekst">Terugkerende tuinklussen bijhouden.</p>

      <div className="td-grid">
        {weekStats && (
          <div className="metric">
            <div className="ml">Deze week</div>
            <div className="mv">{weekStats.percentage}<span className="mu">%</span></div>
            <div className="ms">{weekStats.afgerond}/{weekStats.totaal}</div>
          </div>
        )}
        {maandStats && (
          <div className="metric">
            <div className="ml">Deze maand</div>
            <div className="mv">{maandStats.percentage}<span className="mu">%</span></div>
            <div className="ms">{maandStats.afgerond}/{maandStats.totaal}</div>
          </div>
        )}
      </div>

      <div className="card">
        <SpraakInvoer waarde={invoer} onWaarde={setInvoer} placeholder="bijv. gazon maaien, onkruid wieden, planten water geven..." />
        <div className="hh-freq-rij">
          <button className={`btn btn-sm ${frequentie === 'week' ? 'btn-p' : 'btn-g'}`} onClick={() => setFrequentie('week')}>Wekelijks</button>
          <button className={`btn btn-sm ${frequentie === 'maand' ? 'btn-p' : 'btn-g'}`} onClick={() => setFrequentie('maand')}>Maandelijks</button>
          <button className={`btn btn-sm ${frequentie === 'aangepast' ? 'btn-p' : 'btn-g'}`} onClick={() => setFrequentie('aangepast')}>Aangepast</button>
        </div>
        {frequentie === 'aangepast' && (
          <div className="ti-veld-grp" style={{ marginTop: 'var(--space-sm)' }}>
            <label className="ti-lbl" htmlFor="tt-interval">Elke hoeveel dagen (herhaalt steeds)</label>
            <input
              id="tt-interval"
              type="number"
              className="ti-veld"
              min="1"
              value={intervalDagen}
              onChange={(e) => setIntervalDagen(parseInt(e.target.value, 10) || 1)}
            />
          </div>
        )}
        <div className="ti-veld-grp" style={{ marginTop: 'var(--space-sm)' }}>
          <label className="ti-lbl" htmlFor="tt-uren">Geschatte tijd (uren)</label>
          <input
            id="tt-uren"
            type="number"
            className="ti-veld"
            min="0.25"
            step="0.25"
            value={geschatteUren}
            onChange={(e) => setGeschatteUren(parseFloat(e.target.value) || 0.5)}
          />
          <p className="ti-hint">Gebruikt door de Agenda om een passend tijdvak voor te stellen.</p>
        </div>
        <button className="btn btn-p btn-full" style={{ marginTop: 'var(--space-sm)' }} onClick={takenToevoegen}>
          Tuinklussen toevoegen
        </button>
      </div>

      <div className="card">
        <div className="td-label">Wekelijkse tuinklussen</div>
        {tuinTaken.taken.filter((t) => t.frequentie === 'week').length === 0 && (
          <p className="of-stap-tekst">Nog geen wekelijkse tuinklussen.</p>
        )}
        <div className="hh-lijst">
          {tuinTaken.taken.filter((t) => t.frequentie === 'week').map((t) => {
            const klaar = Boolean(tuinTaken.log[t.id]?.[huidigeWeek]);
            return (
              <div className="hh-item" key={t.id}>
                <button className={`hh-check ${klaar ? 'gedaan' : ''}`} onClick={() => tuinTaken.toggleDezePeriode(t.id, 'week')}>
                  {klaar ? '✓' : ''}
                </button>
                <span className={`hh-tekst ${klaar ? 'gedaan' : ''}`}>{t.tekst}</span>
                <span className="hhp-uren-val">{t.geschatteUren}u</span>
                <button
                  className="hh-verwijder"
                  onClick={() => { if (window.confirm(`"${t.tekst}" verwijderen?`)) tuinTaken.verwijder(t.id); }}
                >✕</button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div className="td-label">Maandelijkse tuinklussen</div>
        {tuinTaken.taken.filter((t) => t.frequentie === 'maand').length === 0 && (
          <p className="of-stap-tekst">Nog geen maandelijkse tuinklussen.</p>
        )}
        <div className="hh-lijst">
          {tuinTaken.taken.filter((t) => t.frequentie === 'maand').map((t) => {
            const klaar = Boolean(tuinTaken.log[t.id]?.[huidigeMaand]);
            return (
              <div className="hh-item" key={t.id}>
                <button className={`hh-check ${klaar ? 'gedaan' : ''}`} onClick={() => tuinTaken.toggleDezePeriode(t.id, 'maand')}>
                  {klaar ? '✓' : ''}
                </button>
                <span className={`hh-tekst ${klaar ? 'gedaan' : ''}`}>{t.tekst}</span>
                <span className="hhp-uren-val">{t.geschatteUren}u</span>
                <button
                  className="hh-verwijder"
                  onClick={() => { if (window.confirm(`"${t.tekst}" verwijderen?`)) tuinTaken.verwijder(t.id); }}
                >✕</button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div className="td-label">Aangepaste tuinklussen</div>
        {aangepasteTaken.length === 0 && (
          <p className="of-stap-tekst">Nog geen tuinklussen met een eigen interval.</p>
        )}
        <div className="hh-lijst">
          {aangepasteTaken.map((t) => {
            const klaar = Boolean(tuinTaken.log[t.id]?.[huidigePeriodeKey('aangepast', new Date(), t.intervalDagen)]);
            return (
              <div className="hh-item" key={t.id}>
                <button
                  className={`hh-check ${klaar ? 'gedaan' : ''}`}
                  onClick={() => tuinTaken.toggleDezePeriode(t.id, 'aangepast', t.intervalDagen)}
                >
                  {klaar ? '✓' : ''}
                </button>
                <span className={`hh-tekst ${klaar ? 'gedaan' : ''}`}>
                  {t.tekst}
                  <span className="hhp-werk-badge"> · elke {t.intervalDagen} dagen</span>
                </span>
                <span className="hhp-uren-val">{t.geschatteUren}u</span>
                <button
                  className="hh-verwijder"
                  onClick={() => { if (window.confirm(`"${t.tekst}" verwijderen?`)) tuinTaken.verwijder(t.id); }}
                >✕</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
