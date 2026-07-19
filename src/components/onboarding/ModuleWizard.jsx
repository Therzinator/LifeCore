import { useState } from 'react';
import './ModuleWizard.css';

export default function ModuleWizard({ modules, categorieen, actieveModules, onWijzig, onVoltooien }) {
  const [selectie, setSelectie] = useState(() => new Set(actieveModules));

  function wissel(id) {
    setSelectie((huidig) => {
      const nieuw = new Set(huidig);
      if (nieuw.has(id)) nieuw.delete(id); else nieuw.add(id);
      return nieuw;
    });
  }

  function beginnen() {
    onWijzig([...selectie]);
    onVoltooien();
  }

  return (
    <div className="mw-wrap">
      <div className="mw-titel">Welkom bij LifeCore</div>
      <p className="mw-tekst">
        Welke onderdelen wil je gebruiken? Alles staat aan als goede start — je past dit later altijd aan
        via het accountmenu (Modules).
      </p>

      {categorieen.map((cat) => (
        <div className="mw-categorie" key={cat.id}>
          <div className="mw-categorie-titel">{cat.titel}</div>
          <div className="mw-grid">
            {cat.modules.map((id) => (
              <button
                key={id}
                type="button"
                className={`btn btn-sm ${selectie.has(id) ? 'btn-p' : 'btn-g'}`}
                onClick={() => wissel(id)}
              >{modules[id].label}</button>
            ))}
          </div>
        </div>
      ))}

      <button
        className="btn btn-p btn-full"
        style={{ marginTop: 'var(--space-md)' }}
        onClick={beginnen}
        disabled={selectie.size === 0}
      >
        Beginnen
      </button>
    </div>
  );
}
