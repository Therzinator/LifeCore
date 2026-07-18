import { useState } from 'react';
import { parseSpraakTekst } from '../../lib/werk/tekstParser.js';
import { percentageAfgerond, huidigePeriodeKey } from '../../lib/werk/huishoudPeriode.js';
import SpraakInvoer from './SpraakInvoer.jsx';
import HuishoudProjecten from './HuishoudProjecten.jsx';
import './HuishoudTaken.css';

const SUBTABS = [
  { id: 'terugkerend', label: 'Terugkerend' },
  { id: 'projecten', label: 'Projecten' },
];

export default function HuishoudTaken({ huishoudTaken, huishoudProjecten, toonToast }) {
  const [subtab, setSubtab] = useState('terugkerend');
  const [invoer, setInvoer] = useState('');
  const [frequentie, setFrequentie] = useState('week');

  function takenToevoegen() {
    const teksten = parseSpraakTekst(invoer);
    if (teksten.length === 0) { toonToast('Geen taken gevonden in de tekst', 'wn'); return; }
    huishoudTaken.voegMeerdereToe(teksten, frequentie);
    setInvoer('');
    toonToast(`${teksten.length} klus/klussen toegevoegd`, 'ok');
  }

  const weekStats = percentageAfgerond(huishoudTaken.taken, huishoudTaken.log, 'week');
  const maandStats = percentageAfgerond(huishoudTaken.taken, huishoudTaken.log, 'maand');
  const huidigeWeek = huidigePeriodeKey('week');
  const huidigeMaand = huidigePeriodeKey('maand');

  return (
    <div>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Huishouden</div>
      <p className="of-stap-tekst">Terugkerende klussen en grote klussen opgedeeld in projecten.</p>

      <div className="hh-subtabs">
        {SUBTABS.map((t) => (
          <button key={t.id} className={`hh-subtab ${subtab === t.id ? 'on' : ''}`} onClick={() => setSubtab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {subtab === 'terugkerend' && (
        <>
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
            <SpraakInvoer waarde={invoer} onWaarde={setInvoer} placeholder="bijv. was doen, ramen zemen, stofzuigen..." />
            <div className="hh-freq-rij">
              <button className={`btn btn-sm ${frequentie === 'week' ? 'btn-p' : 'btn-g'}`} onClick={() => setFrequentie('week')}>Wekelijks</button>
              <button className={`btn btn-sm ${frequentie === 'maand' ? 'btn-p' : 'btn-g'}`} onClick={() => setFrequentie('maand')}>Maandelijks</button>
            </div>
            <button className="btn btn-p btn-full" style={{ marginTop: 'var(--space-sm)' }} onClick={takenToevoegen}>
              Klussen toevoegen
            </button>
          </div>

          <div className="card">
            <div className="td-label">Wekelijkse klussen</div>
            {huishoudTaken.taken.filter((t) => t.frequentie === 'week').length === 0 && (
              <p className="of-stap-tekst">Nog geen wekelijkse klussen.</p>
            )}
            <div className="hh-lijst">
              {huishoudTaken.taken.filter((t) => t.frequentie === 'week').map((t) => {
                const klaar = Boolean(huishoudTaken.log[t.id]?.[huidigeWeek]);
                return (
                  <div className="hh-item" key={t.id}>
                    <button className={`hh-check ${klaar ? 'gedaan' : ''}`} onClick={() => huishoudTaken.toggleDezePeriode(t.id, 'week')}>
                      {klaar ? '✓' : ''}
                    </button>
                    <span className={`hh-tekst ${klaar ? 'gedaan' : ''}`}>{t.tekst}</span>
                    <button className="hh-verwijder" onClick={() => huishoudTaken.verwijder(t.id)}>✕</button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <div className="td-label">Maandelijkse klussen</div>
            {huishoudTaken.taken.filter((t) => t.frequentie === 'maand').length === 0 && (
              <p className="of-stap-tekst">Nog geen maandelijkse klussen.</p>
            )}
            <div className="hh-lijst">
              {huishoudTaken.taken.filter((t) => t.frequentie === 'maand').map((t) => {
                const klaar = Boolean(huishoudTaken.log[t.id]?.[huidigeMaand]);
                return (
                  <div className="hh-item" key={t.id}>
                    <button className={`hh-check ${klaar ? 'gedaan' : ''}`} onClick={() => huishoudTaken.toggleDezePeriode(t.id, 'maand')}>
                      {klaar ? '✓' : ''}
                    </button>
                    <span className={`hh-tekst ${klaar ? 'gedaan' : ''}`}>{t.tekst}</span>
                    <button className="hh-verwijder" onClick={() => huishoudTaken.verwijder(t.id)}>✕</button>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {subtab === 'projecten' && <HuishoudProjecten projecten={huishoudProjecten} toonToast={toonToast} />}
    </div>
  );
}
