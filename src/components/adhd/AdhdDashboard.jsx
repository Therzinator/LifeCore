import { useState } from 'react';
import { useDagdata } from '../../hooks/useDagdata.js';
import { useDagTypeOverrides } from '../../hooks/useDagTypeOverrides.js';
import { dagLimiet, minutenTotStopmoment, middagAdvies, effectieveEnergie } from '../../lib/adhd/dagLimiet.js';
import { datumKey } from '../../utils/datum.js';
import OnderbouwingModal from '../ui/OnderbouwingModal.jsx';
import SpraakKnop from '../ui/SpraakKnop.jsx';
import './AdhdDashboard.css';

const ENERGIE_LABEL = { laag: 'Laag', midden: 'Midden', hoog: 'Hoog' };
const MIDDAG_OPTIES = [
  { id: 'laag', label: 'Lager dan vanochtend' },
  { id: 'zelfde', label: 'Ongeveer hetzelfde' },
  { id: 'hoog', label: 'Nog steeds goed' },
];

export default function AdhdDashboard({ adhdDag, instellingen, onStartFocus, focusMoetVerlagen = false }) {
  const dagdata = useDagdata();
  const { overrides: dagTypeOverrides } = useDagTypeOverrides();
  const [nieuweTaak, setNieuweTaak] = useState('');
  const [toonUitleg, setToonUitleg] = useState(null);

  const vandaagOverride = dagTypeOverrides[datumKey()] ?? null;
  const ochtendEnergie = dagdata.dag.checkin?.energie ?? null;
  const huidigeEnergie = effectieveEnergie(ochtendEnergie, adhdDag.dag.middagEnergie, focusMoetVerlagen);
  const limiet = dagLimiet(huidigeEnergie, instellingen.werkurenPerDag);
  const openTaken = adhdDag.dag.taken.filter((t) => !t.klaar).length;
  const takenPct = Math.min(100, Math.round((openTaken / limiet.taken) * 100));

  const focusUren = adhdDag.dag.focusMinuten / 60;
  const urenPct = Math.min(100, Math.round((focusUren / limiet.uren) * 100));
  const daglimietBereikt = focusUren >= limiet.uren;

  const restMinuten = minutenTotStopmoment(instellingen.eindtijd);
  const stopmomentNadert = restMinuten > 0 && restMinuten <= 15;

  function toevoegen(e) {
    e.preventDefault();
    const tekst = nieuweTaak.trim();
    if (!tekst) return;
    adhdDag.voegTaakToe(tekst);
    setNieuweTaak('');
  }

  return (
    <div>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Vandaag</div>
      <p className="of-stap-tekst">Klein en haalbaar — pas het aantal taken aan op je energie.</p>
      <button className="ad-link" onClick={() => setToonUitleg('adhdCoaching')}>Waarom werkt dit?</button>

      {vandaagOverride && (
        <div className="ad-banner">
          {vandaagOverride === 'vrij'
            ? '🌴 Vandaag staat in de Agenda genoteerd als vrije dag.'
            : '💼 Vandaag staat in de Agenda genoteerd als werkdag (buiten je vaste patroon).'}
        </div>
      )}
      {stopmomentNadert && (
        <div className="ad-banner warn">⏰ Stopmoment nadert ({instellingen.eindtijd}) — rond je huidige taak af, start niets nieuws.</div>
      )}
      {daglimietBereikt && (
        <div className="ad-banner warn">
          Je hebt je daglimiet van {limiet.uren} uur bereikt vandaag. Overweeg te stoppen — meer doen is geen must.
        </div>
      )}

      <div className="card">
        <div className="ad-energie-rij">
          <span className="ad-energie-lbl">Energie vandaag</span>
          <span className={`ad-energie-badge ${huidigeEnergie || 'onbekend'}`}>
            {ENERGIE_LABEL[huidigeEnergie] ?? 'Nog niet ingevuld'}
          </span>
        </div>
        {!ochtendEnergie && <p className="ad-hint">Vul je energie in bij de ochtend-check-in voor een passende daglimiet.</p>}
        {focusMoetVerlagen && (
          <p className="ad-hint">Je burn-out/herstel-check wees op aanhoudende uitputting — de daglimiet staat daarom op laag.</p>
        )}

        <div className="ad-limiet-track"><div className="ad-limiet-fill" style={{ width: `${takenPct}%` }} /></div>
        <div className="ad-limiet-lbl">{openTaken}/{limiet.taken} taken · focusblok {limiet.blok} min</div>

        <div className="ad-limiet-track" style={{ marginTop: 'var(--space-sm)' }}>
          <div className={`ad-limiet-fill ${daglimietBereikt ? 'vol' : ''}`} style={{ width: `${urenPct}%` }} />
        </div>
        <div className="ad-limiet-lbl">{focusUren.toFixed(1)}/{limiet.uren} uur vandaag</div>
        <button className="ad-link" style={{ marginBottom: 0, marginTop: 'var(--space-xs)' }} onClick={() => setToonUitleg('werkgrenzen')}>
          Waarom een urenlimiet en afleiding beperken?
        </button>
      </div>

      <div className="card">
        <div className="td-label">Middagcheck</div>
        <p className="of-stap-tekst">Hoe is je energie nu, vergeleken met vanochtend?</p>
        <div className="ad-middag-rij">
          {MIDDAG_OPTIES.map((o) => (
            <button
              key={o.id}
              className={`btn btn-sm ${adhdDag.dag.middagEnergie === o.id ? 'btn-p' : 'btn-g'}`}
              onClick={() => adhdDag.setMiddagEnergie(o.id)}
            >
              {o.label}
            </button>
          ))}
        </div>
        {adhdDag.dag.middagEnergie && <p className="ad-hint">{middagAdvies(adhdDag.dag.middagEnergie)}</p>}
      </div>

      <div className="card">
        <div className="td-label">Taken vandaag</div>
        {adhdDag.dag.taken.length === 0 && <p className="of-stap-tekst">Nog geen taken — voeg er hieronder een toe of haal er een uit het klusboek.</p>}
        <div className="ad-takenlijst">
          {adhdDag.dag.taken.map((t) => (
            <div className="ad-taak" key={t.id}>
              <button className={`ad-taak-check ${t.klaar ? 'gedaan' : ''}`} onClick={() => adhdDag.toggleTaak(t.id)}>
                {t.klaar ? '✓' : ''}
              </button>
              <span className={`ad-taak-tekst ${t.klaar ? 'gedaan' : ''}`}>{t.tekst}</span>
              {!t.klaar && (
                <button className="btn btn-g btn-sm" onClick={() => onStartFocus(t.tekst, limiet.blok)}>⏱ Focus</button>
              )}
              <button className="ad-taak-verwijder" onClick={() => adhdDag.verwijderTaak(t.id)}>✕</button>
            </div>
          ))}
        </div>

        <form className="ad-toevoeg-rij" onSubmit={toevoegen}>
          <input
            className="ad-toevoeg-veld"
            type="text"
            placeholder="Nieuwe taak..."
            value={nieuweTaak}
            onChange={(e) => setNieuweTaak(e.target.value)}
          />
          <SpraakKnop waarde={nieuweTaak} onWaarde={setNieuweTaak} compact />
          <button className="btn btn-g btn-sm" type="submit">Toevoegen</button>
        </form>
      </div>

      <div className="td-grid">
        <div className="metric">
          <div className="ml">Focus vandaag</div>
          <div className="mv">{adhdDag.dag.focusMinuten} <span className="mu">min</span></div>
        </div>
        <div className="metric">
          <div className="ml">Afgerond</div>
          <div className="mv">{adhdDag.dag.taken.filter((t) => t.klaar).length}</div>
        </div>
        <div className="metric">
          <div className="ml">Pauzes</div>
          <div className="mv">{adhdDag.dag.pauzes}</div>
        </div>
        <div className="metric">
          <div className="ml">Onderbrekingen</div>
          <div className="mv">{adhdDag.dag.onderbrekingen}</div>
        </div>
      </div>

      {toonUitleg && <OnderbouwingModal sleutel={toonUitleg} onClose={() => setToonUitleg(null)} />}
    </div>
  );
}
