import { useState } from 'react';
import { useSync } from '../../hooks/useSync.js';
import { leesLokaal, schrijfLokaal } from '../../lib/storage/lokaal.js';
import { MODULE_ICONEN, IconChevron, IconInstellingen, IconAccount } from '../ui/ModuleIconen.jsx';
import { MODULES, MODULE_VOLGORDE } from '../../lib/nav/modules.js';
import AccountModal from '../ui/AccountModal.jsx';
import './DesktopShell.css';

const STATUS_LABEL = {
  lokaal: 'Lokaal',
  bezig: 'Synchroniseren...',
  gelukt: 'Gesynchroniseerd',
  mislukt: 'Mislukt',
};

export default function DesktopShell({ pagina, setPagina, auth, onInstellingen, children }) {
  const sync = useSync(auth?.user?.id);
  const toonSync = auth?.enabled && auth?.ingelogd;
  const [ingeklapt, setIngeklapt] = useState(() => leesLokaal('zijbalk_ingeklapt', false));
  const [toonAccount, setToonAccount] = useState(false);

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
          {auth?.enabled && (
            <button className="ds-instellingen-btn" onClick={() => setToonAccount(true)} aria-label="Account">
              <IconAccount className="ds-instellingen-icoon" />
            </button>
          )}
          <button className="ds-instellingen-btn" onClick={onInstellingen} aria-label="Instellingen">
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
        {MODULE_VOLGORDE.map((id) => {
          const Icoon = MODULE_ICONEN[id];
          const label = MODULES[id].label;
          return (
            <button
              key={id}
              type="button"
              className={`ds-nav-item ${pagina === id ? 'actief' : ''}`}
              onClick={() => setPagina(id)}
              title={ingeklapt ? label : undefined}
            >
              <Icoon className="ds-nav-icoon" />
              <span className="ds-nav-label">{label}</span>
            </button>
          );
        })}
      </nav>

      <main className="ds-content">{children}</main>

      {toonAccount && <AccountModal auth={auth} onClose={() => setToonAccount(false)} />}
    </div>
  );
}
