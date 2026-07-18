import './TrainingGeschiedenis.css';

export default function TrainingGeschiedenis({ sessies }) {
  const omgekeerd = [...sessies].reverse();

  return (
    <div>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Geschiedenis</div>
      {omgekeerd.length === 0 && <p className="of-stap-tekst">Nog geen trainingen gelogd.</p>}
      <div className="tg-lijst">
        {omgekeerd.map((sessie, i) => (
          <div className="tg-item" key={i}>
            <div className="tg-datum">
              {new Date(sessie.datum).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })} — Training {sessie.letter}
            </div>
            <div className="tg-oefeningen">
              {sessie.oefeningen
                .map((o) => `${o.naam} ${o.gewicht}kg (${o.setsGedaan}/${o.setsTotaal})`)
                .join(' · ')}
            </div>
            {sessie.extraOefeningen?.length > 0 && (
              <div className="tg-extra">
                {sessie.extraOefeningen.map((e) => `${e.naam} ${e.gewicht}kg (${e.sets} sets)`).join(' · ')}
              </div>
            )}
            <div className="tg-volume">Volume: {(sessie.volume || 0).toLocaleString('nl-NL')} kg</div>
          </div>
        ))}
      </div>
    </div>
  );
}
