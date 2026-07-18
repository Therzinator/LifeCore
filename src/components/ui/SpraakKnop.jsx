import { useSpraakHerkenning } from '../../hooks/useSpraakHerkenning.js';
import './SpraakKnop.css';

export default function SpraakKnop({ waarde, onWaarde, compact = false }) {
  const { ondersteund, opnemen, startOpnemen, stopOpnemen } = useSpraakHerkenning(waarde, onWaarde);

  if (!ondersteund) return null;

  return (
    <button
      type="button"
      className={`sk-btn ${compact ? 'sk-compact' : ''} ${opnemen ? 'actief' : ''}`}
      onClick={opnemen ? stopOpnemen : startOpnemen}
      aria-label={opnemen ? 'Stop spraakinvoer' : 'Start spraakinvoer'}
    >
      {opnemen ? '⏹' : '🎤'}
    </button>
  );
}
