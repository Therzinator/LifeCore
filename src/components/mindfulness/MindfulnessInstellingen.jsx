import GeluidKiezer from '../ui/GeluidKiezer.jsx';

export default function MindfulnessInstellingen({ instellingen, bewaar }) {
  return (
    <div>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Instellingen</div>
      <p className="of-stap-tekst">Geluid bij het afronden van een ademoefening.</p>

      <div className="card">
        <div className="td-label">Geluid</div>
        <GeluidKiezer
          label="Geluid bij einde ademhalingsoefening"
          waarde={instellingen.geluidFragment}
          onWaarde={(v) => bewaar({ geluidFragment: v })}
        />
      </div>
    </div>
  );
}
