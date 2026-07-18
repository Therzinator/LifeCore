export default function AlgemeneInstellingen({ onTerug }) {
  return (
    <div className="of-wrap">
      <button className="btn btn-text" onClick={onTerug}>← Terug</button>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Instellingen</div>
      <p className="of-stap-tekst">Deze module heeft geen eigen instellingen.</p>
      <p className="ains-hint">
        Geluidsinstellingen voor timers vind je bij de instellingen van de betreffende module zelf
        (Training, Focus, Mindfulness, Ochtend) — open de module en tik daar op het tandwiel.
      </p>
    </div>
  );
}
