import { groeiPerWeek, omgevingsVerdeling, trainingsAdviezen } from '../../lib/cardio/sessies.js';
import { tempoLabel } from '../../lib/cardio/tempo.js';
import './CardioGroei.css';

function weekLabel(maandagIso) {
  return new Date(maandagIso).toLocaleDateString('nl-NL', { day: 'numeric', month: 'numeric' });
}

export default function CardioGroei({ sessies }) {
  const groei = groeiPerWeek(sessies);
  const omgeving = omgevingsVerdeling(sessies);
  const adviezen = trainingsAdviezen(sessies);
  const maxAfstand = Math.max(...groei.afstandPerWeek, 1) * 1.1;

  return (
    <div>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Groeicurve</div>

      <div className="card">
        <div className="td-label">Afstand per week (km)</div>
        {groei.labels.length === 0 ? (
          <p className="of-stap-tekst">Nog geen sessies met een afstand.</p>
        ) : (
          <>
            <div className="cg-chart">
              {groei.afstandPerWeek.map((km, i) => (
                <div key={i} className="cg-bar" style={{ height: `${Math.round((km / maxAfstand) * 100)}%` }} title={`${km} km`} />
              ))}
            </div>
            <div className="cg-chart-labels">
              {groei.labels.map((l, i) => <div key={i} className="cg-chart-lbl">{weekLabel(l)}</div>)}
            </div>
          </>
        )}
      </div>

      <div className="td-grid">
        <div className="metric">
          <div className="ml">Totaal km</div>
          <div className="mv">{groei.totaalKm.toFixed(0)}</div>
        </div>
        <div className="metric">
          <div className="ml">Sessies</div>
          <div className="mv">{groei.totaalSessies}</div>
        </div>
        <div className="metric">
          <div className="ml">Beste tempo</div>
          <div className="mv" style={{ fontSize: 'var(--font-size-base)' }}>
            {groei.besteTempoSec ? `${tempoLabel(groei.besteTempoSec)}/km` : '—'}
          </div>
        </div>
      </div>

      {omgeving.totaal > 0 && (
        <div className="card">
          <div className="td-label">Natuur vs. stad</div>
          <p className="of-stap-tekst" style={{ marginBottom: 'var(--space-sm)' }}>
            Wandelen en lopen in het groen geeft een grotere cortisoldaling dan een vergelijkbare stedelijke wandeling.
          </p>
          <div className="cg-omgeving-bar">
            {omgeving.natuur > 0 && (
              <div className="cg-omgeving-deel natuur" style={{ flex: omgeving.natuur }}>{omgeving.natuur}</div>
            )}
            {omgeving.stad > 0 && (
              <div className="cg-omgeving-deel stad" style={{ flex: omgeving.stad }}>{omgeving.stad}</div>
            )}
            {omgeving.onbekend > 0 && (
              <div className="cg-omgeving-deel onbekend" style={{ flex: omgeving.onbekend }}>{omgeving.onbekend}</div>
            )}
          </div>
          <div className="cg-omgeving-legenda">
            <span><span className="cg-dot natuur" /> Natuur ({omgeving.natuur})</span>
            <span><span className="cg-dot stad" /> Stad ({omgeving.stad})</span>
          </div>
        </div>
      )}

      {adviezen.length > 0 && (
        <div className="card">
          <div className="td-label">Suggesties op basis van je sessies</div>
          {adviezen.map((a) => (
            <p key={a.kop} className="cg-advies-rij">
              <span>{a.icoon}</span> <strong>{a.kop}</strong> — {a.tekst}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
