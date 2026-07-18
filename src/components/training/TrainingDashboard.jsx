import { liftcoreBibliotheekLijst } from '../../lib/oefeningen/vrijeOefeningenDb.js';
import OefeningenBibliotheek from '../ui/OefeningenBibliotheek.jsx';
import './TrainingDashboard.css';

function uniekeOefeningen(programma) {
  const gezien = new Set();
  return [...programma.A, ...programma.B].filter((o) => {
    if (gezien.has(o.id)) return false;
    gezien.add(o.id);
    return true;
  });
}

export default function TrainingDashboard({ profiel, programma, geschiedenis, instellingen, volgendeLetter, onStart }) {
  const oef = programma[volgendeLetter];
  const nr = geschiedenis.sessies.length + 1;

  const uur = new Date().getHours();
  const groet = uur < 12 ? 'Goedemorgen' : uur < 18 ? 'Goedemiddag' : 'Goedenavond';

  const totaalVolume = geschiedenis.sessies.reduce((s, t) => s + (t.volume || 0), 0);

  return (
    <div>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>{groet}</div>
      <p className="of-stap-tekst">
        Volgende: Training {volgendeLetter} — {oef.map((o) => o.naam).join(', ')}
      </p>
      <OefeningenBibliotheek oefeningen={liftcoreBibliotheekLijst()} titel="StrongLifts-basis — bibliotheek" />

      <div className="card td-volgende">
        <div className="td-label">Volgende training</div>
        <div className="td-naam">Training {volgendeLetter}</div>
        <div className="td-oef">{oef.map((o) => o.naam).join(' · ')}</div>
        <div className="td-week">Week {Math.ceil(nr / 3)} · Sessie {nr}</div>
        <button className="btn btn-p btn-full" onClick={onStart}>Training starten →</button>
      </div>

      <div className="td-grid">
        {uniekeOefeningen(programma).slice(0, 6).map((o) => (
          <div className="metric" key={o.id}>
            <div className="ml">{o.naam}</div>
            <div className="mv">{profiel.gewichten[o.id] ?? '—'} <span className="mu">kg</span></div>
          </div>
        ))}
      </div>

      <div className="td-grid">
        <div className="metric">
          <div className="ml">Trainingen</div>
          <div className="mv">{geschiedenis.sessies.length}</div>
        </div>
        <div className="metric">
          <div className="ml">Streak</div>
          <div className="mv">{Math.floor(geschiedenis.sessies.length / 3)} <span className="mu">wk</span></div>
        </div>
        <div className="metric">
          <div className="ml">Volume</div>
          <div className="mv">{(totaalVolume / 1000).toFixed(1)} <span className="mu">t</span></div>
        </div>
      </div>

      <p className="td-programma">Actief programma: {instellingen.programma === 'sl5x5' ? 'StrongLifts 5×5' : 'Madcow 5×5'}</p>
    </div>
  );
}
