import { useState } from 'react';
import { useSync } from '../../hooks/useSync.js';
import { IconAccount } from '../ui/ModuleIconen.jsx';
import Modal from '../ui/Modal.jsx';
import ProfielInstellingenModal from '../ui/ProfielInstellingenModal.jsx';
import NotitiesKnop from '../ui/NotitiesKnop.jsx';
import './AppHeader.css';

const STATUS_LABEL = {
  lokaal: 'Lokaal',
  bezig: 'Synchroniseren...',
  gelukt: 'Gesynchroniseerd',
  mislukt: 'Mislukt',
};

export default function AppHeader({ auth, setPagina, appUpdate, moduleVoorkeuren, huishouden, pagina }) {
  const sync = useSync(auth?.user?.id);
  const toonSync = auth?.enabled && auth?.ingelogd;
  const [toonProfiel, setToonProfiel] = useState(false);

  return (
    <header className="app-header">
      <button type="button" className="app-brand" onClick={() => setPagina?.('snelkeuze')} aria-label="Naar snelkeuze">
        <span className="app-brand-dot" aria-hidden="true" />
        LifeCore
      </button>
      <div className="app-header-acties">
        {toonSync && (
          <div className="app-sync">
            <span className={`sync-dot ${sync.status}`} aria-hidden="true" />
            <button className="app-sync-btn" onClick={sync.syncNu} disabled={sync.status === 'bezig'}>
              {STATUS_LABEL[sync.status]}
            </button>
          </div>
        )}
        <NotitiesKnop huidigeModule={pagina} />
        <div className="app-instellingen-groep">
          <button className="app-instellingen-btn" onClick={() => setToonProfiel(true)} aria-label="Account">
            <IconAccount className="app-instellingen-icoon" />
          </button>
          <span className="app-versie">{__APP_VERSION__}</span>
        </div>
      </div>
      {toonProfiel && (
        <Modal titel="Profiel & account" onClose={() => setToonProfiel(false)}>
          <ProfielInstellingenModal auth={auth} appUpdate={appUpdate} moduleVoorkeuren={moduleVoorkeuren} huishouden={huishouden} onUitgelogd={() => setToonProfiel(false)} />
        </Modal>
      )}
    </header>
  );
}
