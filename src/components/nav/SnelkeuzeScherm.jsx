import { MODULE_ICONEN } from '../ui/ModuleIconen.jsx';
import WeekOverzicht from '../ui/WeekOverzicht.jsx';
import { MODULES, MODULE_CATEGORIEEN } from '../../lib/nav/modules.js';
import './SnelkeuzeScherm.css';

export default function SnelkeuzeScherm({ onKies }) {
  return (
    <div className="sk-wrap" role="region" aria-label="Snelkeuze">
      <div className="sk-header">
        <div className="sk-titel">Wat wil je doen?</div>
        <div className="sk-subtitel">Kies een module om te beginnen</div>
      </div>

      <WeekOverzicht />

      {MODULE_CATEGORIEEN.map((categorie) => (
        <div className="sk-categorie" key={categorie.id}>
          <div className="sk-categorie-titel">{categorie.titel}</div>
          <div className="sk-grid">
            {categorie.modules.map((id) => {
              const module = MODULES[id];
              const Icoon = MODULE_ICONEN[id];
              return (
                <button key={id} type="button" className="sk-knop" onClick={() => onKies(id)}>
                  <Icoon className="sk-icoon" aria-hidden="true" />
                  <span className="sk-tekst">
                    <span className="sk-knop-titel">{module.label}</span>
                    <span className="sk-knop-subtitel">{module.subtitel}</span>
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
