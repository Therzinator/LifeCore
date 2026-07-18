import { useSpraakHerkenning } from '../../hooks/useSpraakHerkenning.js';
import './SpraakInvoer.css';

export default function SpraakInvoer({ waarde, onWaarde, placeholder }) {
  const { ondersteund, opnemen, verwerken, laadVoortgang, startOpnemen, stopOpnemen } = useSpraakHerkenning(waarde, onWaarde);

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
            className={`si-mic-btn ${opnemen ? 'actief' : ''} ${verwerken ? 'verwerkt' : ''}`}
            onClick={opnemen ? stopOpnemen : startOpnemen}
            disabled={verwerken}
            aria-label={opnemen ? 'Stop opname' : 'Start spraakinvoer'}
          >
            {verwerken ? '⏳' : opnemen ? '⏹' : '🎤'}
          </button>
        )}
      </div>
      {!ondersteund && <p className="si-hint">Spraakinvoer wordt niet ondersteund in deze browser — typ hierboven.</p>}
      {opnemen && <p className="si-hint">Aan het opnemen... tik nogmaals om te stoppen en te laten verwerken.</p>}
      {verwerken && <p className="si-hint">Spraak wordt verwerkt...</p>}
      {laadVoortgang !== null && (
        <p className="si-hint">Spraakmodel wordt gedownload ({laadVoortgang}%) — dit hoeft maar één keer.</p>
      )}
    </div>
  );
}
