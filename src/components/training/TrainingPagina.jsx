import { useEffect, useState } from 'react';
import { useTrainingProfiel } from '../../hooks/useTrainingProfiel.js';
import { useTrainingGeschiedenis } from '../../hooks/useTrainingGeschiedenis.js';
import { useActieveTraining } from '../../hooks/useActieveTraining.js';
import { useTrainingInstellingen } from '../../hooks/useTrainingInstellingen.js';
import { useExtraOefeningen } from '../../hooks/useExtraOefeningen.js';
import { usePersoonsProfiel } from '../../hooks/usePersoonsProfiel.js';
import { useRustTimer } from '../../hooks/useRustTimer.js';
import { useProgramma } from '../../hooks/useProgramma.js';
import { PROFIELEN, EXTRA, extraGroepenVoorLetter, haalExtraGewicht } from '../../lib/training/schema.js';
import { berekenOpbouwsets } from '../../lib/training/opbouw.js';
import TrainingSessie from './TrainingSessie.jsx';
import TrainingDashboard from './TrainingDashboard.jsx';
import TrainingExtra from './TrainingExtra.jsx';
import TrainingProgressie from './TrainingProgressie.jsx';
import TrainingGeschiedenis from './TrainingGeschiedenis.jsx';
import TrainingInstellingen from './TrainingInstellingen.jsx';
import TrainingProgramma from './TrainingProgramma.jsx';
import PersoonsProfiel from './PersoonsProfiel.jsx';
import './TrainingPagina.css';

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'programma', label: 'Programma' },
  { id: 'extra', label: 'Extra' },
  { id: 'progressie', label: 'Progressie' },
  { id: 'geschiedenis', label: 'Geschiedenis' },
  { id: 'profiel', label: 'Mijn profiel' },
  { id: 'instellingen', label: 'Instellingen' },
];

function volgendeLetterUit(laatste) {
  if (!laatste) return 'A';
  return laatste.letter === 'A' ? 'B' : 'A';
}

export default function TrainingPagina({ toonToast, instellingenSignaal }) {
  const profiel = useTrainingProfiel();
  const geschiedenis = useTrainingGeschiedenis();
  const actieveTraining = useActieveTraining();
  const programma = useProgramma();
  const { instellingen, bewaar: bewaarInstellingen, reset: resetInstellingen } = useTrainingInstellingen();
  const extraOefeningen = useExtraOefeningen();
  const persoonsProfiel = usePersoonsProfiel();
  const rustTimer = useRustTimer(instellingen.geluidFragment);
  const [tab, setTab] = useState('dashboard');

  useEffect(() => {
    if (instellingenSignaal) setTab('instellingen');
  }, [instellingenSignaal]);

  if (!profiel.profiel.profielNaam) {
    return (
      <div className="of-wrap">
        <div className="card">
          <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Kies je startgewicht</div>
          <p className="of-stap-tekst">Je kunt dit later altijd aanpassen bij Mijn profiel.</p>
          <div className="wv-grid">
            {Object.keys(PROFIELEN).map((naam) => (
              <button key={naam} className="wv-chip" onClick={() => profiel.kiesProfiel(naam)}>
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
            setExtras={actieveTraining.setExtras}
            setWarmup={actieveTraining.setWarmup}
            instellingen={instellingen}
            geschiedenis={geschiedenis}
            setGewicht={profiel.setGewicht}
            rustTimer={rustTimer}
            toonToast={toonToast}
            onAfgerond={() => { rustTimer.stop(); actieveTraining.wisTraining(); setTab('dashboard'); }}
          />
        </div>
      </div>
    );
  }

  function start() {
    const letter = volgendeLetterUit(geschiedenis.laatste);
    const instStangen = { stangRecht: instellingen.stangRecht, stangCurl: instellingen.stangCurl };

    const oefeningen = programma.programma[letter].map((oef) => {
      const gewicht = profiel.profiel.gewichten[oef.id] ?? 20;
      const opbouwLengte = berekenOpbouwsets(gewicht, oef.stangType, instellingen.gewichtStap, instStangen).length;
      return {
        id: oef.id, naam: oef.naam, sets: oef.sets, reps: oef.reps, type: oef.type,
        stangType: oef.stangType, spier: oef.spier, increment: oef.increment ?? instellingen.gewichtStap,
        gewicht,
        werk: Array(oef.sets).fill(false),
        ob: Array(opbouwLengte).fill(null),
        setGew: Array(oef.sets).fill(gewicht),
        setReps: Array(oef.sets).fill(oef.reps),
      };
    });

    const actieveExtra = extraGroepenVoorLetter(letter)
      .flatMap((groep) => EXTRA[groep])
      .filter((e) => extraOefeningen.actief.includes(e.id));

    const extras = actieveExtra.map((e) => {
      const gewicht = haalExtraGewicht(e.id, geschiedenis.sessies);
      return {
        id: e.id, naam: e.naam, spier: e.spier, equip: e.equip,
        sets: 3, reps: 10, gewicht,
        werk: Array(3).fill(false),
        setGew: Array(3).fill(gewicht),
        setReps: Array(3).fill(10),
      };
    });

    actieveTraining.startTraining(letter, oefeningen, extras);
  }

  function resetAlles() {
    resetInstellingen();
    profiel.wisProfiel();
    extraOefeningen.wisAlles();
    actieveTraining.wisTraining();
    geschiedenis.wis();
    programma.resetStandaard();
    setTab('dashboard');
  }

  return (
    <div className="of-wrap">
      <div className="tp-tabs">
        {TABS.map((t) => (
          <button key={t.id} className={`tp-tab ${tab === t.id ? 'on' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="card">
        {tab === 'dashboard' && (
          <TrainingDashboard
            profiel={profiel.profiel}
            programma={programma.programma}
            geschiedenis={geschiedenis}
            instellingen={instellingen}
            volgendeLetter={volgendeLetterUit(geschiedenis.laatste)}
            onStart={start}
          />
        )}
        {tab === 'programma' && (
          <TrainingProgramma programma={programma} profiel={profiel} instellingen={instellingen} toonToast={toonToast} />
        )}
        {tab === 'extra' && <TrainingExtra extraOefeningen={extraOefeningen} />}
        {tab === 'progressie' && (
          <TrainingProgressie
            profiel={profiel.profiel}
            programma={programma.programma}
            geschiedenis={geschiedenis}
            extraOefeningen={extraOefeningen}
          />
        )}
        {tab === 'geschiedenis' && <TrainingGeschiedenis sessies={geschiedenis.sessies} />}
        {tab === 'profiel' && (
          <PersoonsProfiel
            persoonsProfiel={persoonsProfiel}
            trainingProfiel={profiel}
            instellingen={instellingen}
            toonToast={toonToast}
          />
        )}
        {tab === 'instellingen' && (
          <TrainingInstellingen
            instellingen={instellingen}
            bewaar={bewaarInstellingen}
            onResetAlles={resetAlles}
            toonToast={toonToast}
          />
        )}
      </div>
    </div>
  );
}
