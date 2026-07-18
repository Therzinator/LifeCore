import { useState } from 'react';
import { isNieuweTempoPR, adviesConsistentie } from '../../lib/cardio/sessies.js';
import OnderbouwingModal from '../ui/OnderbouwingModal.jsx';
import SpraakKnop from '../ui/SpraakKnop.jsx';
import './CardioRegistreren.css';

const TYPE_OPTIES = [
  { id: 'hardlopen', label: '🏃 Hardlopen' },
  { id: 'wandelen', label: '🚶 Wandelen' },
  { id: 'fietsen', label: '🚴 Fietsen' },
  { id: 'roeien', label: '🚣 Roeimachine' },
  { id: 'anders', label: '⚡ Anders' },
];

function vandaagIso() {
  return new Date().toISOString().slice(0, 10);
}

function leegFormulier() {
  return {
    type: 'hardlopen', datum: vandaagIso(), omgeving: '',
    duur: '', afstand: '', tempo: '', hartslag: '', rpe: '', notities: '',
  };
}

export default function CardioRegistreren({ cardio, toonToast }) {
  const [form, setForm] = useState(leegFormulier());
  const [toonUitleg, setToonUitleg] = useState(null);

  const buitenActiviteit = form.type === 'hardlopen' || form.type === 'wandelen';
  const advies = adviesConsistentie(cardio.sessies);

  function veld(naam, waarde) {
    setForm((huidig) => ({ ...huidig, [naam]: waarde }));
  }

  function opslaan(e) {
    e.preventDefault();
    if (!form.datum) { toonToast('Kies een datum', 'wn'); return; }
    const duur = parseInt(form.duur, 10);
    if (!duur || duur < 1) { toonToast('Vul de duur in', 'wn'); return; }

    const afstand = parseFloat(form.afstand) || 0;
    const isPR = isNieuweTempoPR(form.type, afstand, form.tempo, cardio.sessies);

    cardio.voegToe({
      datum: form.datum,
      type: form.type,
      omgeving: buitenActiviteit ? form.omgeving || null : null,
      duur,
      afstand,
      tempo: form.tempo.trim(),
      hartslag: parseInt(form.hartslag, 10) || 0,
      rpe: parseInt(form.rpe, 10) || 0,
      notities: form.notities.trim(),
      pr: isPR,
    });

    setForm({ ...leegFormulier(), type: form.type, datum: form.datum });
    toonToast(isPR ? '🏆 Nieuwe PR! Sessie opgeslagen' : 'Sessie opgeslagen', 'ok');
  }

  return (
    <div>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Nieuwe sessie</div>
      <p className="of-stap-tekst">Log wat je gedaan hebt — geen minimum, elke sessie telt.</p>
      <button className="cr-link" type="button" onClick={() => setToonUitleg('hardlopen')}>Waarom werkt dit?</button>

      <form onSubmit={opslaan}>
        <div className="cr-veldgroep">
          <label className="cr-lbl" htmlFor="cr-type">Type activiteit</label>
          <select id="cr-type" className="cr-veld" value={form.type} onChange={(e) => veld('type', e.target.value)}>
            {TYPE_OPTIES.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        </div>

        {buitenActiviteit && (
          <div className="cr-veldgroep">
            <label className="cr-lbl">Omgeving</label>
            <div className="cr-keuzerij">
              <button
                type="button"
                className={`cr-keuze ${form.omgeving === 'natuur' ? 'on' : ''}`}
                onClick={() => veld('omgeving', 'natuur')}
              >
                🌳 Natuur
              </button>
              <button
                type="button"
                className={`cr-keuze ${form.omgeving === 'stad' ? 'on' : ''}`}
                onClick={() => veld('omgeving', 'stad')}
              >
                🏙 Stad
              </button>
            </div>
            <button className="cr-link" type="button" onClick={() => setToonUitleg('natuurWandelen')}>
              Waarom maakt de omgeving verschil?
            </button>
          </div>
        )}

        <div className="cr-grid">
          <div className="cr-veldgroep">
            <label className="cr-lbl" htmlFor="cr-datum">Datum</label>
            <input id="cr-datum" className="cr-veld" type="date" value={form.datum} onChange={(e) => veld('datum', e.target.value)} />
          </div>
          <div className="cr-veldgroep">
            <label className="cr-lbl" htmlFor="cr-duur">Duur (min)</label>
            <input id="cr-duur" className="cr-veld" type="number" min="1" max="300" placeholder="45" value={form.duur} onChange={(e) => veld('duur', e.target.value)} />
          </div>
          <div className="cr-veldgroep">
            <label className="cr-lbl" htmlFor="cr-afstand">Afstand (km)</label>
            <input id="cr-afstand" className="cr-veld" type="number" min="0" step="0.1" placeholder="5.0" value={form.afstand} onChange={(e) => veld('afstand', e.target.value)} />
          </div>
          <div className="cr-veldgroep">
            <label className="cr-lbl" htmlFor="cr-tempo">Gem. tempo (min/km)</label>
            <input id="cr-tempo" className="cr-veld" type="text" placeholder="5:30" value={form.tempo} onChange={(e) => veld('tempo', e.target.value)} />
          </div>
          <div className="cr-veldgroep">
            <label className="cr-lbl" htmlFor="cr-hartslag">Gem. hartslag (bpm)</label>
            <input id="cr-hartslag" className="cr-veld" type="number" min="50" max="220" placeholder="148" value={form.hartslag} onChange={(e) => veld('hartslag', e.target.value)} />
          </div>
          <div className="cr-veldgroep">
            <label className="cr-lbl" htmlFor="cr-rpe">RPE (1–10)</label>
            <input id="cr-rpe" className="cr-veld" type="number" min="1" max="10" placeholder="6" value={form.rpe} onChange={(e) => veld('rpe', e.target.value)} />
          </div>
        </div>

        <div className="cr-veldgroep">
          <label className="cr-lbl" htmlFor="cr-notities">Notities</label>
          <div className="sk-inline-rij">
            <input id="cr-notities" className="cr-veld" type="text" placeholder="Hoe voelde het?" value={form.notities} onChange={(e) => veld('notities', e.target.value)} />
            <SpraakKnop waarde={form.notities} onWaarde={(v) => veld('notities', v)} compact />
          </div>
        </div>

        <button className="btn btn-p btn-full" type="submit">Sessie opslaan ✓</button>
      </form>

      {advies && (
        <div className="cr-advies">
          {advies.map((punt) => (
            <p key={punt.kop}><strong>{punt.kop}</strong> — {punt.tekst}</p>
          ))}
        </div>
      )}

      {toonUitleg && <OnderbouwingModal sleutel={toonUitleg} onClose={() => setToonUitleg(null)} />}
    </div>
  );
}
