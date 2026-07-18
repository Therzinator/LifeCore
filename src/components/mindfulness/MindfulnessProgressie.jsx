import './MindfulnessProgressie.css';

function weekLabel(maandagIso) {
  return new Date(maandagIso).toLocaleDateString('nl-NL', { day: 'numeric', month: 'numeric' });
}

export default function MindfulnessProgressie({ stats, laden, ingelogd }) {
  if (!ingelogd) {
    return <p className="of-stap-tekst">Log in om je voortgang te zien.</p>;
  }
  if (laden) {
    return <p className="of-stap-tekst">Voortgang laden...</p>;
  }

  const maxMinuten = Math.max(...stats.minutenPerWeek, 1) * 1.1;

  return (
    <div>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Progressie</div>
      <p className="of-stap-tekst">
        Effect van mindfulness is meestal pas na ~8 weken consistente praktijk merkbaar en blijft tot 3 maanden
        daarna aanwezig — consistentie telt hier zwaarder dan een enkele lange sessie.
      </p>

      <div className="card">
        <div className="td-label">Minuten per week</div>
        {stats.labels.length === 0 ? (
          <p className="of-stap-tekst">Nog geen sessies geluisterd.</p>
        ) : (
          <>
            <div className="mp-chart">
              {stats.minutenPerWeek.map((min, i) => (
                <div key={i} className="mp-bar" style={{ height: `${Math.round((min / maxMinuten) * 100)}%` }} title={`${min} min`} />
              ))}
            </div>
            <div className="mp-chart-labels">
              {stats.labels.map((l, i) => <div key={i} className="mp-chart-lbl">{weekLabel(l)}</div>)}
            </div>
          </>
        )}
      </div>

      <div className="td-grid">
        <div className="metric">
          <div className="ml">Totaal sessies</div>
          <div className="mv">{stats.totaalSessies}</div>
        </div>
        <div className="metric">
          <div className="ml">Totaal minuten</div>
          <div className="mv">{stats.totaalMinuten}</div>
        </div>
      </div>
    </div>
  );
}
