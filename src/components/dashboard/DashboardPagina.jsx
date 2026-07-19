import { useTrainingGeschiedenis } from '../../hooks/useTrainingGeschiedenis.js';
import { useTrainingInstellingen } from '../../hooks/useTrainingInstellingen.js';
import { useCardioChecklist } from '../../hooks/useCardioChecklist.js';
import { useWerkTaken } from '../../hooks/useWerkTaken.js';
import { useHuishoudTaken } from '../../hooks/useHuishoudTaken.js';
import { krachtPerWeek } from '../../lib/training/dashboardKracht.js';
import { checklistPerWeek } from '../../lib/cardio/checklist.js';
import { werkTakenPerWeek } from '../../lib/werk/dashboardWerk.js';
import { percentagePerWeek } from '../../lib/werk/huishoudPeriode.js';
import LijnGrafiek from './LijnGrafiek.jsx';

function weekLabel(maandagIso) {
  return new Date(maandagIso).toLocaleDateString('nl-NL', { day: 'numeric', month: 'numeric' });
}

export default function DashboardPagina({ huishoudenId }) {
  const geschiedenis = useTrainingGeschiedenis();
  const { instellingen: trainingInstellingen } = useTrainingInstellingen();
  const checklist = useCardioChecklist();
  const werkTaken = useWerkTaken();
  const huishoudTaken = useHuishoudTaken(huishoudenId);

  const kracht = krachtPerWeek(geschiedenis.sessies);
  const overgangWeek = trainingInstellingen.programmaOvergangsdatum
    ? new Date(trainingInstellingen.programmaOvergangsdatum)
    : null;
  const overgangIndex = overgangWeek
    ? kracht.labels.findIndex((l) => new Date(l) >= overgangWeek)
    : -1;

  const cardio = checklistPerWeek(checklist.dagen);
  const werk = werkTakenPerWeek(werkTaken.alleTaken);
  const huishouden = percentagePerWeek(huishoudTaken.taken, huishoudTaken.log);

  return (
    <div className="of-wrap">
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Dashboard</div>
      <p className="of-stap-tekst">
        Voortgang over alle modules heen. Geschiedenis blijft altijd zichtbaar, ook na een gemiste dag of week —
        een gat in de lijn is geen falen.
      </p>

      <div className="card">
        <div className="td-label">Kracht — sterkteprogressie (som geschatte 1RM per week)</div>
        <LijnGrafiek
          labels={kracht.labels.map(weekLabel)}
          waarden={kracht.totalen}
          eenheid=" kg"
          annotatieIndex={overgangIndex >= 0 ? overgangIndex : null}
          annotatieLabel="Madcow"
        />
      </div>

      <div className="card">
        <div className="td-label">Cardio — activiteiten per week</div>
        <LijnGrafiek labels={cardio.labels.map(weekLabel)} waarden={cardio.aantalPerWeek} eenheid="×" />
      </div>

      <div className="card">
        <div className="td-label">Werk-focus — afgeronde taken per week</div>
        <LijnGrafiek labels={werk.labels.map(weekLabel)} waarden={werk.aantalPerWeek} eenheid="×" />
      </div>

      <div className="card">
        <div className="td-label">Huishouden — % afgerond per week</div>
        <LijnGrafiek labels={huishouden.labels.map(weekLabel)} waarden={huishouden.percentages} eenheid="%" />
      </div>
    </div>
  );
}
