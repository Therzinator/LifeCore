import { MODULE_ICONEN } from '../ui/ModuleIconen.jsx';
import './SnelkeuzeScherm.css';

const TEGELS = [
  { id: 'ochtend', titel: 'Ochtend', subtitel: 'Start je dag met de ochtend-flow' },
  { id: 'waarden', titel: 'Waarden', subtitel: 'ACT-waarden en dagelijkse reflectie' },
  { id: 'welzijn', titel: 'Welzijn', subtitel: 'Burn-out check en herstelcheck' },
  { id: 'mindfulness', titel: 'Mindfulness', subtitel: 'Adem, grounding en ontspanning' },
  { id: 'training', titel: 'Training', subtitel: 'Volg en start je trainingssessies' },
  { id: 'cardio', titel: 'Cardio', subtitel: 'Hardlopen, wandelen en roeien loggen' },
  { id: 'adhd', titel: 'Focus', subtitel: 'Taken, focus-timer en dag afsluiten' },
  { id: 'werk', titel: 'Werk', subtitel: 'Werktaken en huishouden met spraakinvoer' },
  { id: 'dashboard', titel: 'Dashboard', subtitel: 'Voortgang over alle modules heen' },
];

export default function SnelkeuzeScherm({ onKies }) {
  return (
    <div className="sk-wrap" role="region" aria-label="Snelkeuze">
      <div className="sk-header">
        <div className="sk-titel">Wat wil je doen?</div>
        <div className="sk-subtitel">Kies een module om te beginnen</div>
      </div>
      <div className="sk-grid">
        {TEGELS.map((tegel) => {
          const Icoon = MODULE_ICONEN[tegel.id];
          return (
            <button key={tegel.id} type="button" className="sk-knop" onClick={() => onKies(tegel.id)}>
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
  );
}
