import './TrainingGeschiedenis.css';

export default function TrainingGeschiedenis({ sessies, onTerug }) {
  const omgekeerd = [...sessies].reverse();

  return (
    <div>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Geschiedenis</div>
      {omgekeerd.length === 0 && <p className="of-stap-tekst">Nog geen trainingen gelogd.</p>}
      <div className="tg-lijst">
        {omgekeerd.map((sessie, i) => (
          <div className="tg-item" key={i}>
            <div className="tg-datum">
              {new Date(sessie.datum).toLocaleDateString('nl-NL')} — Training {sessie.letter}
            </div>
            <div className="tg-oefeningen">
              {sessie.oefeningen
                .map((o) => `${o.naam} ${o.gewicht}kg (${o.setsGedaan}/${o.setsTotaal})`)
                .join(' · ')}
            </div>
          </div>
        ))}
      </div>
      <div className="of-acties">
        <button className="btn btn-text" onClick={onTerug}>Terug</button>
      </div>
    </div>
  );
}
