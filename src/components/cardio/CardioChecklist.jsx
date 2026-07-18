import { CARDIO_ACTIVITEITEN } from '../../lib/cardio/checklist.js';
import { vandaagKey } from '../../utils/datum.js';
import './CardioChecklist.css';

export default function CardioChecklist({ checklist }) {
  const vandaag = vandaagKey();

  return (
    <div>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Vandaag</div>
      <p className="of-stap-tekst">Simpel afvinken — geen afstand of tijd, alleen gedaan of niet.</p>

      <div className="cc-lijst">
        {CARDIO_ACTIVITEITEN.map((a) => {
          const gedaan = Boolean(checklist.vandaag[a.id]);
          return (
            <button key={a.id} className={`cc-item ${gedaan ? 'gedaan' : ''}`} onClick={() => checklist.toggle(a.id, vandaag)}>
              <span className="cc-check">{gedaan ? '✓' : ''}</span>
              <span>{a.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
