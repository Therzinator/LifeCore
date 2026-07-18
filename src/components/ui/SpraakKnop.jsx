import { useSpraakHerkenning } from '../../hooks/useSpraakHerkenning.js';
import './SpraakKnop.css';

export default function SpraakKnop({ waarde, onWaarde, compact = false }) {
  const { ondersteund, opnemen, verwerken, laadVoortgang, startOpnemen, stopOpnemen } = useSpraakHerkenning(waarde, onWaarde);

  if (!ondersteund) return null;

  const label = verwerken
    ? 'Bezig met verwerken...'
    : laadVoortgang !== null
      ? `Spraakmodel laden (${laadVoortgang}%)`
      : opnemen
        ? 'Stop opname'
        : 'Start spraakinvoer';

  return (
    <button
      type="button"
      className={`sk-btn ${compact ? 'sk-compact' : ''} ${opnemen ? 'actief' : ''} ${verwerken ? 'verwerkt' : ''}`}
      onClick={opnemen ? stopOpnemen : startOpnemen}
      disabled={verwerken}
      aria-label={label}
      title={label}
    >
      {verwerken ? '⏳' : opnemen ? '⏹' : '🎤'}
    </button>
  );
}
