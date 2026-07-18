import { useState } from 'react';
import { useSync } from '../../hooks/useSync.js';
import { leesLokaal, schrijfLokaal } from '../../lib/storage/lokaal.js';
import { MODULE_ICONEN, IconChevron, IconInstellingen } from '../ui/ModuleIconen.jsx';
import './DesktopShell.css';

const STATUS_LABEL = {
  lokaal: 'Lokaal',
  bezig: 'Synchroniseren...',
  gelukt: 'Gesynchroniseerd',
  mislukt: 'Mislukt',
};

const MODULES = [
  { id: 'ochtend', label: 'Ochtend' },
  { id: 'waarden', label: 'Waarden' },
  { id: 'welzijn', label: 'Welzijn' },
  { id: 'mindfulness', label: 'Mindfulness' },
  { id: 'training', label: 'Training' },
  { id: 'cardio', label: 'Cardio' },
  { id: 'adhd', label: 'Focus' },
];

export default function DesktopShell({ pagina, setPagina, auth, children }) {
  const sync = useSync(auth?.user?.id);
  const toonSync = auth?.enabled && auth?.ingelogd;
  const [ingeklapt, setIngeklapt] = useState(() => leesLokaal('zijbalk_ingeklapt', false));

  function wisselZijbalk() {
    setIngeklapt((huidig) => {
      const nieuw = !huidig;
      schrijfLokaal('zijbalk_ingeklapt', nieuw);
      return nieuw;
    });
  }

  return (
    <div className={`ds-layout ${ingeklapt ? 'ingeklapt' : ''}`}>
      <header className="ds-topbar">
        <div className="ds-brand">
          <span className="ds-brand-dot" aria-hidden="true" />
          LifeCore
        </div>
        <div className="ds-topbar-acties">
          {toonSync && (
            <div className="ds-sync">
              <span className={`ds-sync-dot ${sync.status}`} aria-hidden="true" />
              <button className="ds-sync-btn" onClick={sync.syncNu} disabled={sync.status === 'bezig'}>
                {STATUS_LABEL[sync.status]}
              </button>
            </div>
          )}
          <button className="ds-instellingen-btn" onClick={() => setPagina('instellingen')} aria-label="Algemene instellingen">
            <IconInstellingen className="ds-instellingen-icoon" />
          </button>
        </div>
      </header>

      <nav className="ds-zijbalk">
        <button
          type="button"
          className="ds-zijbalk-toggle"
          onClick={wisselZijbalk}
          aria-label={ingeklapt ? 'Zijbalk uitklappen' : 'Zijbalk inklappen'}
          title={ingeklapt ? 'Zijbalk uitklappen' : 'Zijbalk inklappen'}
        >
          <IconChevron className={`ds-zijbalk-toggle-icoon ${ingeklapt ? '' : 'gedraaid'}`} />
        </button>
        {MODULES.map((mod) => {
          const Icoon = MODULE_ICONEN[mod.id];
          return (
            <button
              key={mod.id}
              type="button"
              className={`ds-nav-item ${pagina === mod.id ? 'actief' : ''}`}
              onClick={() => setPagina(mod.id)}
              title={ingeklapt ? mod.label : undefined}
            >
              <Icoon className="ds-nav-icoon" />
              <span className="ds-nav-label">{mod.label}</span>
            </button>
          );
        })}
      </nav>

      <main className="ds-content">{children}</main>
    </div>
  );
}
