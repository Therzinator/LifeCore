import { useState } from 'react';
import { KOMPAS_DOMEINEN, kompasTrend } from '../../lib/act/kompas.js';
import { volgendeCheckDatum, checkIsVerschuldigd } from '../../lib/welzijn/vragenset.js';
import { relatieveTijd } from '../../utils/datum.js';
import BullsEyeTarget from './BullsEyeTarget.jsx';
import OnderbouwingModal from '../ui/OnderbouwingModal.jsx';
import './WaardenKompas.css';

const TREND_ICOON = { dichterbij: '↑', verder: '↓', gelijk: '→' };
const TREND_LABEL = { dichterbij: 'dichterbij', verder: 'verder weg', gelijk: 'gelijk gebleven' };

function leegInvoer() {
  const invoer = {};
  KOMPAS_DOMEINEN.forEach((d) => { invoer[d.id] = { waarde: '', score: 5 }; });
  return invoer;
}

function datumLabel(iso) {
  return new Date(iso).toLocaleDateString('nl-NL', { day: 'numeric', month: 'numeric' });
}

export default function WaardenKompas({ kompas, instellingen }) {
  const [bewerken, setBewerken] = useState(false);
  const [invoer, setInvoer] = useState(leegInvoer);
  const [toonUitleg, setToonUitleg] = useState(false);

  const laatste = kompas.laatste;
  const vorige = kompas.vorige;
  const verschuldigd = checkIsVerschuldigd(laatste?.datum ?? null, instellingen.kompasCadansDagen);
  const volgende = laatste ? volgendeCheckDatum(laatste.datum, instellingen.kompasCadansDagen) : null;
  const trend = laatste && vorige ? kompasTrend(laatste.scores, vorige.scores) : null;

  function beginInvullen() {
    setInvoer(leegInvoer());
    setBewerken(true);
  }

  function zetDomein(id, patch) {
    setInvoer((huidig) => ({ ...huidig, [id]: { ...huidig[id], ...patch } }));
  }

  function opslaan() {
    kompas.nieuweInvulling(invoer);
    setBewerken(false);
  }

  if (bewerken) {
    return (
      <div>
        <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Waardenkompas invullen</div>
        <p className="of-stap-tekst">
          Per domein: welke waarde wil je hier vasthouden, en hoe dicht staat je huidige gedrag daar nu bij?
          Alles is optioneel — vul in wat op dit moment relevant voelt.
        </p>

        {KOMPAS_DOMEINEN.map((d) => (
          <div className="card" key={d.id}>
            <div className="td-label">{d.label}</div>
            <div className="ti-veld-grp">
              <label className="ti-lbl" htmlFor={`kompas-${d.id}-waarde`}>Waarde</label>
              <input
                id={`kompas-${d.id}-waarde`}
                className="ti-veld"
                value={invoer[d.id]?.waarde ?? ''}
                onChange={(e) => zetDomein(d.id, { waarde: e.target.value })}
                placeholder="bijv. aanwezig zijn voor mijn gezin"
              />
            </div>
            <div className="ti-veld-grp">
              <label className="ti-lbl" htmlFor={`kompas-${d.id}-score`}>
                Hoe dicht sta je hier nu bij? ({invoer[d.id]?.score ?? 5}/10)
              </label>
              <input
                id={`kompas-${d.id}-score`}
                type="range" min="1" max="10" className="ti-veld"
                value={invoer[d.id]?.score ?? 5}
                onChange={(e) => zetDomein(d.id, { score: parseInt(e.target.value, 10) })}
              />
            </div>
          </div>
        ))}

        <div className="of-acties">
          <button className="btn btn-text" onClick={() => setBewerken(false)}>Annuleren</button>
          <button className="btn btn-p btn-full" onClick={opslaan}>Opslaan</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Waardenkompas</div>
      <p className="of-stap-tekst">
        Hoe dicht leef je op dit moment bij je waarden, per levensdomein? Hoe dichter bij het midden, hoe
        dichter bij hoe je zou willen leven.
      </p>
      <button className="ad-link" onClick={() => setToonUitleg(true)}>Waarom werkt dit?</button>

      {laatste ? (
        <>
          <BullsEyeTarget scores={laatste.scores} />

          {trend && (
            <div className="kp-trend">
              {KOMPAS_DOMEINEN.map((d) => trend[d.id] && (
                <span key={d.id} className={`kp-trend-item kp-trend-${trend[d.id]}`}>
                  {d.labelKort} {TREND_ICOON[trend[d.id]]} <span className="kp-trend-lbl">{TREND_LABEL[trend[d.id]]}</span>
                </span>
              ))}
            </div>
          )}

          <p className="kp-status">
            Laatst ingevuld: {relatieveTijd(laatste.datum)}
            {verschuldigd ? ' — nu weer aan de beurt.' : ` — volgende vanaf ${datumLabel(volgende.toISOString())}.`}
          </p>
        </>
      ) : (
        <p className="of-stap-tekst">Nog niet eerder ingevuld.</p>
      )}

      <button className="btn btn-p btn-full" onClick={beginInvullen}>
        {laatste ? 'Opnieuw invullen' : 'Eerste keer invullen'}
      </button>

      {toonUitleg && <OnderbouwingModal sleutel="waardenkompasACT" onClose={() => setToonUitleg(false)} />}
    </div>
  );
}
