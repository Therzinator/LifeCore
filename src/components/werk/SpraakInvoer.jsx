import { useSpraakHerkenning } from '../../hooks/useSpraakHerkenning.js';
import './SpraakInvoer.css';

export default function SpraakInvoer({ waarde, onWaarde, placeholder }) {
  const { ondersteund, opnemen, startOpnemen, stopOpnemen } = useSpraakHerkenning(waarde, onWaarde);

  return (
    <div className="si-wrap">
      <div className="si-veld-rij">
        <textarea
          className="si-textarea"
          value={waarde}
          onChange={(e) => onWaarde(e.target.value)}
          placeholder={placeholder}
          rows={4}
        />
        {ondersteund && (
          <button
            type="button"
            className={`si-mic-btn ${opnemen ? 'actief' : ''}`}
            onClick={opnemen ? stopOpnemen : startOpnemen}
            aria-label={opnemen ? 'Stop opname' : 'Start spraakinvoer'}
          >
            {opnemen ? '⏹' : '🎤'}
          </button>
        )}
      </div>
      {!ondersteund && <p className="si-hint">Spraakinvoer wordt niet ondersteund in deze browser — typ hierboven.</p>}
      {opnemen && <p className="si-hint">Aan het luisteren... spreek je taken uit, gescheiden door een korte pauze of &quot;en&quot;.</p>}
    </div>
  );
}
