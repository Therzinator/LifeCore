import { useState } from 'react';
import { KOMPAS_DOMEINEN } from '../../lib/act/kompas.js';
import { relatieveTijd } from '../../utils/datum.js';
import SpraakKnop from '../ui/SpraakKnop.jsx';
import OnderbouwingModal from '../ui/OnderbouwingModal.jsx';
import './ToegewijdeActiePlanner.css';

export default function ToegewijdeActiePlanner({ acties }) {
  const [domeinId, setDomeinId] = useState(KOMPAS_DOMEINEN[0].id);
  const [tekst, setTekst] = useState('');
  const [toonGeschiedenis, setToonGeschiedenis] = useState(false);
  const [toonUitleg, setToonUitleg] = useState(false);

  function toevoegen() {
    if (!tekst.trim()) return;
    acties.voegToe(domeinId, tekst.trim());
    setTekst('');
  }

  return (
    <div>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Toegewijde actie</div>
      <p className="of-stap-tekst">
        Eén waarde, één concrete stap deze week. Bijvoorbeeld: &ldquo;aanstaande dinsdag om 16:00 ga ik
        mijn moeder bellen&rdquo;. Niet gehaald is geen falen — je kunt 'm laten staan of gewoon opnieuw
        plannen.
      </p>
      <button className="ad-link" onClick={() => setToonUitleg(true)}>Waarom werkt dit?</button>

      <div className="card">
        <div className="ti-veld-grp">
          <label className="ti-lbl" htmlFor="tap-domein">Waarde/domein</label>
          <select id="tap-domein" className="ti-veld" value={domeinId} onChange={(e) => setDomeinId(e.target.value)}>
            {KOMPAS_DOMEINEN.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
          </select>
        </div>
        <div className="ti-veld-grp">
          <label className="ti-lbl" htmlFor="tap-tekst">Concrete, tijdgebonden actie</label>
          <div className="sk-inline-rij">
            <textarea
              id="tap-tekst"
              className="do-input"
              value={tekst}
              onChange={(e) => setTekst(e.target.value)}
              placeholder="Bijv. aanstaande dinsdag 16:00 ga ik..."
            />
            <SpraakKnop waarde={tekst} onWaarde={setTekst} />
          </div>
        </div>
        <button className="btn btn-p btn-full" onClick={toevoegen} disabled={!tekst.trim()}>Actie toevoegen</button>
      </div>

      <div className="card">
        <div className="td-label">Openstaand ({acties.openstaand.length})</div>
        {acties.openstaand.length === 0 && <p className="of-stap-tekst">Nog geen toegewijde actie gepland.</p>}
        <div className="tap-lijst">
          {acties.openstaand.map((a) => {
            const domein = KOMPAS_DOMEINEN.find((d) => d.id === a.domeinId);
            return (
              <div className="tap-item" key={a.id}>
                <button className="tap-check" onClick={() => acties.toggleAfgerond(a.id)} aria-label="Markeer als afgerond">○</button>
                <span className="tap-tekst">
                  {a.tekst}
                  {domein && <span className="tap-domein"> · {domein.labelKort}</span>}
                </span>
                <button className="hh-verwijder" onClick={() => acties.verwijder(a.id)} aria-label="Verwijder actie">✕</button>
              </div>
            );
          })}
        </div>
      </div>

      {acties.afgerondeActies.length > 0 && (
        <div className="card">
          <button className="ad-link" onClick={() => setToonGeschiedenis((v) => !v)}>
            {toonGeschiedenis ? 'Verberg geschiedenis' : `Geschiedenis tonen (${acties.afgerondeActies.length})`}
          </button>
          {toonGeschiedenis && (
            <div className="tap-lijst" style={{ marginTop: 'var(--space-sm)' }}>
              {[...acties.afgerondeActies].reverse().map((a) => {
                const domein = KOMPAS_DOMEINEN.find((d) => d.id === a.domeinId);
                return (
                  <div className="tap-item" key={a.id}>
                    <button className="tap-check gedaan" onClick={() => acties.toggleAfgerond(a.id)} aria-label="Markeer als niet afgerond">✓</button>
                    <span className="tap-tekst gedaan">
                      {a.tekst}
                      {domein && <span className="tap-domein"> · {domein.labelKort}</span>}
                    </span>
                    <span className="tap-datum">{relatieveTijd(a.afgerondOp)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {toonUitleg && <OnderbouwingModal sleutel="toegewijdeActieACT" onClose={() => setToonUitleg(false)} />}
    </div>
  );
}
