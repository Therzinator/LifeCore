import { useState } from 'react';
import { useSync } from '../../hooks/useSync.js';
import { leesLokaal, schrijfLokaal } from '../../lib/storage/lokaal.js';
import { MODULE_ICONEN, IconChevron, IconAccount, IconSnelkeuze } from '../ui/ModuleIconen.jsx';
import { MODULES, gefilterdeVolgorde } from '../../lib/nav/modules.js';
import Modal from '../ui/Modal.jsx';
import ProfielInstellingenModal from '../ui/ProfielInstellingenModal.jsx';
import './DesktopShell.css';

const STATUS_LABEL = {
  lokaal: 'Lokaal',
  bezig: 'Synchroniseren...',
  gelukt: 'Gesynchroniseerd',
  mislukt: 'Mislukt',
};

export default function DesktopShell({ pagina, setPagina, auth, appUpdate, moduleVoorkeuren, huishouden, children }) {
  const sync = useSync(auth?.user?.id);
  const toonSync = auth?.enabled && auth?.ingelogd;
  const [ingeklapt, setIngeklapt] = useState(() => leesLokaal('zijbalk_ingeklapt', false));
  const [toonProfiel, setToonProfiel] = useState(false);
  const moduleVolgorde = gefilterdeVolgorde(moduleVoorkeuren.actieveModules);

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
        <button type="button" className="ds-brand" onClick={() => setPagina('snelkeuze')} aria-label="Naar snelkeuze">
          <span className="ds-brand-dot" aria-hidden="true" />
          LifeCore
        </button>
        <div className="ds-topbar-acties">
          {toonSync && (
            <div className="ds-sync">
              <span className={`ds-sync-dot ${sync.status}`} aria-hidden="true" />
              <button className="ds-sync-btn" onClick={sync.syncNu} disabled={sync.status === 'bezig'}>
                {STATUS_LABEL[sync.status]}
              </button>
            </div>
          )}
          <div className="ds-instellingen-groep">
            <button className="ds-instellingen-btn" onClick={() => setToonProfiel(true)} aria-label="Account">
              <IconAccount className="ds-instellingen-icoon" />
            </button>
            <span className="ds-versie">{__APP_VERSION__}</span>
          </div>
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
        <button
          type="button"
          className={`ds-nav-item ${pagina === 'snelkeuze' ? 'actief' : ''}`}
          onClick={() => setPagina('snelkeuze')}
          title={ingeklapt ? 'Start' : undefined}
        >
          <IconSnelkeuze className="ds-nav-icoon" />
          <span className="ds-nav-label">Start</span>
        </button>
        {moduleVolgorde.map((id) => {
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

      {toonProfiel && (
        <Modal titel="Profiel & account" onClose={() => setToonProfiel(false)}>
          <ProfielInstellingenModal auth={auth} appUpdate={appUpdate} moduleVoorkeuren={moduleVoorkeuren} huishouden={huishouden} onUitgelogd={() => setToonProfiel(false)} />
        </Modal>
      )}
    </div>
  );
}
