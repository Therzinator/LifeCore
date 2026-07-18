import { useState } from 'react';
import { MODULE_ICONEN, IconSnelkeuze, IconChevron, IconInstellingen } from '../ui/ModuleIconen.jsx';
import { MODULES, MODULE_CATEGORIEEN } from '../../lib/nav/modules.js';
import './BottomNav.css';

export default function BottomNav({ pagina, setPagina }) {
  const [uitgeklapt, setUitgeklapt] = useState(false);

  // pagina is niet altijd een module-id — bv. 'snelkeuze' en 'instellingen'
  // zijn losse schermen zonder eigen entry in MODULE_ICONEN. Zonder fallback
  // crasht het renderen van een undefined component hier de hele app (buiten
  // bereik van de ErrorBoundary, want BottomNav zit daar niet binnen).
  const HuidigIcoon = pagina === 'snelkeuze' ? IconSnelkeuze : (MODULE_ICONEN[pagina] ?? IconInstellingen);
  const huidigLabel = pagina === 'snelkeuze' ? 'Start' : (MODULES[pagina]?.label ?? 'Instellingen');

  function kies(id) {
    setPagina(id);
    setUitgeklapt(false);
  }

  return (
    <>
      {uitgeklapt && <button type="button" className="bn-backdrop" onClick={() => setUitgeklapt(false)} aria-label="Sluiten" />}
      <div className="bn-wrap">
        {uitgeklapt && (
          <div className="bn-paneel" role="menu" aria-label="Navigatie">
            <div className="bn-grid">
              <button
                type="button"
                className={`bn-grid-item ${pagina === 'snelkeuze' ? 'on' : ''}`}
                onClick={() => kies('snelkeuze')}
              >
                <IconSnelkeuze className="bn-grid-icoon" />
                <span>Start</span>
              </button>
            </div>

            {MODULE_CATEGORIEEN.map((categorie) => (
              <div className="bn-paneel-categorie" key={categorie.id}>
                <div className="bn-paneel-categorie-titel">{categorie.titel}</div>
                <div className="bn-grid">
                  {categorie.modules.map((id) => {
                    const Icoon = MODULE_ICONEN[id];
                    return (
                      <button
                        key={id}
                        type="button"
                        className={`bn-grid-item ${pagina === id ? 'on' : ''}`}
                        onClick={() => kies(id)}
                      >
                        <Icoon className="bn-grid-icoon" />
                        <span>{MODULES[id].label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          className="bn-collapsed"
          onClick={() => setUitgeklapt((v) => !v)}
          aria-expanded={uitgeklapt}
        >
          <HuidigIcoon className="bn-icoon" />
          <span className="bn-collapsed-label">{huidigLabel}</span>
          <IconChevron className={`bn-chevron ${uitgeklapt ? 'uitgeklapt' : ''}`} />
        </button>
      </div>
    </>
  );
}
