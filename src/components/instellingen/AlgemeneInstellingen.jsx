import { useAlgemeneInstellingen } from '../../hooks/useAlgemeneInstellingen.js';
import './AlgemeneInstellingen.css';

const MODULES = [
  { key: 'training', label: 'Training', omschrijving: 'Signaal bij einde rusttimer tussen sets' },
  { key: 'focus', label: 'Focus (werk)', omschrijving: 'Signaal bij einde focusblok' },
  { key: 'ochtend', label: 'Ochtend', omschrijving: 'Signaal bij einde plank-timer' },
];

export default function AlgemeneInstellingen({ onTerug }) {
  const { instellingen, zetGeluid } = useAlgemeneInstellingen();

  return (
    <div className="of-wrap">
      <button className="btn btn-text" onClick={onTerug}>← Terug</button>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Algemene instellingen</div>
      <p className="of-stap-tekst">Instellingen die voor de hele app gelden.</p>

      <div className="card">
        <div className="td-label">Geluid per module</div>
        {MODULES.map((mod) => (
          <div className="ai-rij" key={mod.key}>
            <div>
              <div className="ai-naam">{mod.label}</div>
              <div className="ai-omschrijving">{mod.omschrijving}</div>
            </div>
            <label className="ai-switch">
              <input
                type="checkbox"
                checked={instellingen.geluid[mod.key]}
                onChange={(e) => zetGeluid(mod.key, e.target.checked)}
              />
              <span className="ai-switch-track" />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
