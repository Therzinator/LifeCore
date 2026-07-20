import { useState } from 'react';
import { useTrainingProfiel } from '../../hooks/useTrainingProfiel.js';
import { useTrainingGeschiedenis } from '../../hooks/useTrainingGeschiedenis.js';
import { useActieveTraining } from '../../hooks/useActieveTraining.js';
import { useTrainingInstellingen } from '../../hooks/useTrainingInstellingen.js';
import { useExtraOefeningen } from '../../hooks/useExtraOefeningen.js';
import { usePersoonsProfiel } from '../../hooks/usePersoonsProfiel.js';
import { useRustTimer } from '../../hooks/useRustTimer.js';
import { useProgramma } from '../../hooks/useProgramma.js';
import { useCardioSessies } from '../../hooks/useCardioSessies.js';
import { PROFIELEN, EXTRA, extraGroepenVoorLetter, haalExtraGewicht } from '../../lib/training/schema.js';
import { berekenOpbouwsets } from '../../lib/training/opbouw.js';
import { datumKey } from '../../utils/datum.js';
import TrainingSessie from './TrainingSessie.jsx';
import TrainingDashboard from './TrainingDashboard.jsx';
import TrainingExtra from './TrainingExtra.jsx';
import TrainingProgressie from './TrainingProgressie.jsx';
import TrainingGeschiedenis from './TrainingGeschiedenis.jsx';
import TrainingInstellingen from './TrainingInstellingen.jsx';
import TrainingProgramma from './TrainingProgramma.jsx';
import PersoonsProfiel from './PersoonsProfiel.jsx';
import ModuleInstellingenKnop from '../ui/ModuleInstellingenKnop.jsx';
import { useRegistreerSubstap } from '../../contexts/SubstapContext.jsx';
import './TrainingPagina.css';

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'programma', label: 'Programma' },
  { id: 'extra', label: 'Extra' },
  { id: 'progressie', label: 'Progressie' },
  { id: 'geschiedenis', label: 'Geschiedenis' },
  { id: 'profiel', label: 'Mijn profiel' },
];

function volgendeLetterUit(laatste) {
  if (!laatste) return 'A';
  return laatste.letter === 'A' ? 'B' : 'A';
}

export default function TrainingPagina({ toonToast }) {
  const profiel = useTrainingProfiel();
  const geschiedenis = useTrainingGeschiedenis();
  const actieveTraining = useActieveTraining();
  const programma = useProgramma();
  const { instellingen, bewaar: bewaarInstellingen, reset: resetInstellingen } = useTrainingInstellingen();
  const extraOefeningen = useExtraOefeningen();
  const persoonsProfiel = usePersoonsProfiel();
  const rustTimer = useRustTimer(instellingen.geluidFragment);
  const cardioSessies = useCardioSessies();
  const [tab, setTab] = useState('dashboard');
  const [toonSessie, setToonSessie] = useState(true);
  useRegistreerSubstap(
    !profiel.profiel.profielNaam
      ? 'Kies startgewicht'
      : actieveTraining.training.letter
        ? `Training ${actieveTraining.training.letter}`
        : TABS.find((t) => t.id === tab)?.label,
  );

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

  function annuleer() {
    if (!window.confirm('Deze training annuleren? Alle voortgang gaat verloren, er wordt niets opgeslagen in je geschiedenis.')) return;
    rustTimer.stop();
    actieveTraining.wisTraining();
    setToonSessie(true);
    setTab('dashboard');
  }

  if (actieveTraining.training.letter && toonSessie) {
    return (
      <div className="of-wrap">
        <div className="card">
          <div className="tp-sessie-kop-acties">
            <button type="button" className="btn btn-text" onClick={() => setToonSessie(false)}>← Terug naar dashboard</button>
            <button type="button" className="btn btn-text tp-annuleer-knop" onClick={annuleer}>Training annuleren</button>
          </div>
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
            onAfgerond={() => { rustTimer.stop(); actieveTraining.wisTraining(); setToonSessie(true); setTab('dashboard'); }}
          />
        </div>
      </div>
    );
  }

  function start() {
    const vandaag = datumKey();
    const krachtVandaag = geschiedenis.sessies.some((s) => datumKey(new Date(s.datum)) === vandaag);
    const cardioVandaag = cardioSessies.sessies.some((s) => s.datum === vandaag);
    if (krachtVandaag || cardioVandaag) {
      const wat = krachtVandaag && cardioVandaag ? 'een training en een cardiosessie' : krachtVandaag ? 'een training' : 'een cardiosessie';
      if (!window.confirm(`Je hebt vandaag al ${wat} gedaan. Toch een nieuwe training starten?`)) return;
    }

    const letter = volgendeLetterUit(geschiedenis.laatste);
    const instStangen = { stangRecht: instellingen.stangRecht, stangCurl: instellingen.stangCurl };

    const oefeningen = programma.programma[letter].map((oef) => {
      const gewicht = profiel.profiel.gewichten[oef.id] ?? 20;
      const opbouwLengte = berekenOpbouwsets(gewicht, oef.stangType, instellingen.gewichtStap, instStangen, instellingen.opbouwStappen).length;
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
    setToonSessie(true);
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
      {actieveTraining.training.letter && (
        <div className="card tp-hervat-banner">
          <span>Training {actieveTraining.training.letter} loopt nog — niet afgerond</span>
          <button type="button" className="btn btn-p btn-sm" onClick={() => setToonSessie(true)}>Hervatten →</button>
        </div>
      )}
      <div className="mik-kop-rij">
        <div className="tp-tabs" style={{ flex: 1, minWidth: 0 }}>
          {TABS.map((t) => (
            <button key={t.id} className={`tp-tab ${tab === t.id ? 'on' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        <ModuleInstellingenKnop titel="LiftCore-instellingen">
          <TrainingInstellingen
            instellingen={instellingen}
            bewaar={bewaarInstellingen}
            onResetAlles={resetAlles}
            toonToast={toonToast}
          />
        </ModuleInstellingenKnop>
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
            bewaarInstellingen={bewaarInstellingen}
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
      </div>
    </div>
  );
}
