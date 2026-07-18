import { MODULE_ICONEN } from '../ui/ModuleIconen.jsx';
import './SnelkeuzeScherm.css';

const TEGELS = {
  ochtend: { titel: 'Ochtend', subtitel: 'Start je dag met de ochtend-flow' },
  waarden: { titel: 'Waarden', subtitel: 'ACT-waarden en dagelijkse reflectie' },
  welzijn: { titel: 'Welzijn', subtitel: 'Burn-out check en herstelcheck' },
  mindfulness: { titel: 'Mindfulness', subtitel: 'Adem, grounding en ontspanning' },
  training: { titel: 'Training', subtitel: 'Volg en start je trainingssessies' },
  cardio: { titel: 'Cardio', subtitel: 'Hardlopen, wandelen en roeien loggen' },
  adhd: { titel: 'Focus', subtitel: 'Taken, focus-timer en dag afsluiten' },
  werk: { titel: 'Werk', subtitel: 'Werktaken en huishouden met spraakinvoer' },
  dashboard: { titel: 'Dashboard', subtitel: 'Voortgang over alle modules heen' },
};

const CATEGORIEEN = [
  { id: 'dag', titel: 'Dag & focus', modules: ['ochtend', 'adhd', 'werk'] },
  { id: 'lichaam', titel: 'Lichaam', modules: ['training', 'cardio'] },
  { id: 'geest', titel: 'Rust & geest', modules: ['waarden', 'welzijn', 'mindfulness'] },
  { id: 'overzicht', titel: 'Overzicht', modules: ['dashboard'] },
];

export default function SnelkeuzeScherm({ onKies }) {
  return (
    <div className="sk-wrap" role="region" aria-label="Snelkeuze">
      <div className="sk-header">
        <div className="sk-titel">Wat wil je doen?</div>
        <div className="sk-subtitel">Kies een module om te beginnen</div>
      </div>

      {CATEGORIEEN.map((categorie) => (
        <div className="sk-categorie" key={categorie.id}>
          <div className="sk-categorie-titel">{categorie.titel}</div>
          <div className="sk-grid">
            {categorie.modules.map((id) => {
              const tegel = TEGELS[id];
              const Icoon = MODULE_ICONEN[id];
              return (
                <button key={id} type="button" className="sk-knop" onClick={() => onKies(id)}>
                  <Icoon className="sk-icoon" aria-hidden="true" />
                  <span className="sk-tekst">
                    <span className="sk-knop-titel">{tegel.titel}</span>
                    <span className="sk-knop-subtitel">{tegel.subtitel}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
