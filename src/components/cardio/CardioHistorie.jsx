import { tempoLabel, tempoNaarSec } from '../../lib/cardio/tempo.js';
import './CardioHistorie.css';

const TYPE_ICOON = { hardlopen: '🏃', wandelen: '🚶', fietsen: '🚴', roeien: '🚣', anders: '⚡' };
const TYPE_LABEL = { hardlopen: 'Hardlopen', wandelen: 'Wandelen', fietsen: 'Fietsen', roeien: 'Roeimachine', anders: 'Anders' };

function datumLabel(iso) {
  return new Date(iso).toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' });
}

export default function CardioHistorie({ sessies, onVerwijder, toonToast }) {
  if (sessies.length === 0) {
    return <p className="of-stap-tekst">Nog geen sessies geregistreerd.</p>;
  }

  function verwijder(id) {
    onVerwijder(id);
    toonToast('Sessie verwijderd', 'neu');
  }

  return (
    <div>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Recente sessies</div>
      <div className="ch-lijst">
        {sessies.slice(0, 30).map((s) => (
          <div className="ch-rij" key={s.id}>
            <div className="ch-icoon">{TYPE_ICOON[s.type] || '⚡'}</div>
            <div className="ch-info">
              <div className="ch-datum">{datumLabel(s.datum)}</div>
              <div className="ch-type">
                {TYPE_LABEL[s.type] || s.type}{s.niveau ? ` — ${s.niveau}` : ''}
              </div>
              <div className="ch-stats">
                {s.duur}:{String(s.duurSeconden ?? 0).padStart(2, '0')} min
                {s.afstand ? ` · ${s.afstand.toFixed(2)} km` : ''}
                {s.tempo && tempoNaarSec(s.tempo) ? ` · ${tempoLabel(tempoNaarSec(s.tempo))}/km` : ''}
                {s.hartslag ? ` · ${s.hartslag} bpm` : ''}
                {s.rpe ? ` · RPE ${s.rpe}` : ''}
              </div>
              {(s.omgeving || s.pr) && (
                <div className="ch-badges">
                  {s.omgeving === 'natuur' && <span className="ch-badge natuur">🌳 natuur</span>}
                  {s.omgeving === 'stad' && <span className="ch-badge stad">🏙 stad</span>}
                  {s.pr && <span className="ch-badge pr">🏆 PR</span>}
                </div>
              )}
              {s.notities && <div className="ch-notities">{s.notities}</div>}
            </div>
            <button className="btn btn-g btn-sm" onClick={() => verwijder(s.id)}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}
