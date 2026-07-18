import GeluidKiezer from '../ui/GeluidKiezer.jsx';

export default function OchtendInstellingen({ instellingen, bewaar, onSluiten }) {
  return (
    <div className="of-wrap">
      <button className="btn btn-text" onClick={onSluiten}>← Terug</button>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Instellingen</div>
      <p className="of-stap-tekst">Instellingen voor de ochtend-flow.</p>

      <div className="card">
        <div className="td-label">Geluid</div>
        <GeluidKiezer
          label="Geluid bij einde plank-timer"
          waarde={instellingen.geluidFragment}
          onWaarde={(v) => bewaar({ geluidFragment: v })}
        />
      </div>
    </div>
  );
}
