import { useState } from 'react';
import { useTrainingProfiel } from '../../hooks/useTrainingProfiel.js';
import { useTrainingGeschiedenis } from '../../hooks/useTrainingGeschiedenis.js';
import { useActieveTraining } from '../../hooks/useActieveTraining.js';
import { SCHEMA, PROFIELEN } from '../../lib/training/schema.js';
import TrainingSessie from './TrainingSessie.jsx';
import TrainingGeschiedenis from './TrainingGeschiedenis.jsx';

function volgendeLetterUit(laatste) {
  if (!laatste) return 'A';
  return laatste.letter === 'A' ? 'B' : 'A';
}

export default function TrainingPagina() {
  const { profiel, kiesProfiel, setGewicht } = useTrainingProfiel();
  const geschiedenis = useTrainingGeschiedenis();
  const actieveTraining = useActieveTraining();
  const [toonGeschiedenis, setToonGeschiedenis] = useState(false);

  if (!profiel.profielNaam) {
    return (
      <div className="of-wrap">
        <div className="card">
          <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Kies je startgewicht</div>
          <p className="of-stap-tekst">Je kunt dit later altijd aanpassen.</p>
          <div className="wv-grid">
            {Object.keys(PROFIELEN).map((naam) => (
              <button key={naam} className="wv-chip" onClick={() => kiesProfiel(naam)}>
                {naam}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (actieveTraining.training.letter) {
    return (
      <div className="of-wrap">
        <div className="card">
          <TrainingSessie
            training={actieveTraining.training}
            setOefeningen={actieveTraining.setOefeningen}
            setGewicht={setGewicht}
            geschiedenis={geschiedenis}
            onAfgerond={() => actieveTraining.wisTraining()}
          />
        </div>
      </div>
    );
  }

  if (toonGeschiedenis) {
    return (
      <div className="of-wrap">
        <div className="card">
          <TrainingGeschiedenis sessies={geschiedenis.sessies} onTerug={() => setToonGeschiedenis(false)} />
        </div>
      </div>
    );
  }

  const volgendeLetter = volgendeLetterUit(geschiedenis.laatste);

  function start() {
    const schemaOefeningen = SCHEMA[volgendeLetter];
    const oefeningen = schemaOefeningen.map((oef) => ({
      id: oef.id,
      naam: oef.naam,
      sets: oef.sets,
      reps: oef.reps,
      spier: oef.spier,
      stangType: oef.stangType,
      gewicht: profiel.gewichten[oef.id],
      afgevinkt: Array(oef.sets).fill(false),
    }));
    actieveTraining.startTraining(volgendeLetter, oefeningen);
  }

  return (
    <div className="of-wrap">
      <div className="card">
        <div className="wp-titel">Training {volgendeLetter}</div>
        <div className="wp-laatst">
          {geschiedenis.laatste ? `Laatste training: ${geschiedenis.laatste.letter}` : 'Nog geen training gedaan'}
        </div>
        <button className="btn btn-p btn-full" onClick={start}>Start training</button>
      </div>
      <button className="btn btn-text" onClick={() => setToonGeschiedenis(true)}>Geschiedenis bekijken</button>
    </div>
  );
}
