import { useTrainingGeschiedenis } from '../../hooks/useTrainingGeschiedenis.js';
import { useCardioChecklist } from '../../hooks/useCardioChecklist.js';
import { useEigenBedrijfInstellingen } from '../../hooks/useEigenBedrijfInstellingen.js';
import { bepaalWeekoverzicht } from '../../lib/dagstructuur/weekoverzicht.js';
import './WeekOverzicht.css';

const ICOON = { lift: '🏋', cardio: '🏃', rust: '—' };

// Gecombineerd week-overzicht (liftdagen + aanbevolen cardiodagen) —
// verhuisd van Training's eigen dashboard naar het startscherm/hoofd-
// dashboard, zodat het onderdeel is van de dagstructuur i.p.v. verstopt in
// één module. Het Eigen bedrijf-merkje (🌱) is additief bovenop de
// bestaande lift/cardio/rust-stip — een TJB-blok op een cardiodag (bv.
// dinsdag) verdringt die stip niet, het is een los signaal ernaast.
export default function WeekOverzicht({ onKiesDag }) {
  const geschiedenis = useTrainingGeschiedenis();
  const cardio = useCardioChecklist();
  const { instellingen: eigenBedrijfInstellingen } = useEigenBedrijfInstellingen();
  const dagen = bepaalWeekoverzicht(geschiedenis.sessies, cardio.dagen, eigenBedrijfInstellingen.blokken);

  return (
    <div className="wo-wrap">
      <div className="wo-titel">Deze week</div>
      <div className="wo-grid">
        {dagen.map((dag) => {
          let cls = `wo-dag-dot ${dag.type}`;
          if (dag.gedaan) cls += ' klaar';
          if (dag.vandaag) cls += ' vandaag';
          const icoon = dag.gedaan ? '✓' : ICOON[dag.type];
          return (
            <button
              type="button"
              className="wo-dag"
              key={dag.label + dag.type}
              onClick={() => onKiesDag?.(dag.datum)}
              disabled={!onKiesDag}
            >
              <div className="wo-dag-lbl">{dag.label}</div>
              <div className={cls}>{icoon}</div>
              {dag.eigenBedrijf.length > 0 && <span className="wo-dag-eb" aria-label="Eigen bedrijf">🌱</span>}
            </button>
          );
        })}
      </div>
      <div className="wo-legenda">
        <span><span className="wo-legenda-dot lift" /> Liftdag</span>
        <span><span className="wo-legenda-dot cardio" /> Cardio (aanbevolen)</span>
        <span><span className="wo-legenda-dot eigenbedrijf" /> Eigen bedrijf</span>
      </div>
    </div>
  );
}
