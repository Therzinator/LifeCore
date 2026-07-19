import { useState } from 'react';
import { useSync } from '../../hooks/useSync.js';
import { IconInstellingen, IconAccount } from '../ui/ModuleIconen.jsx';
import AccountModal from '../ui/AccountModal.jsx';
import Modal from '../ui/Modal.jsx';
import ProfielInstellingenModal from '../ui/ProfielInstellingenModal.jsx';
import './AppHeader.css';

const STATUS_LABEL = {
  lokaal: 'Lokaal',
  bezig: 'Synchroniseren...',
  gelukt: 'Gesynchroniseerd',
  mislukt: 'Mislukt',
};

export default function AppHeader({ auth, setPagina }) {
  const sync = useSync(auth?.user?.id);
  const toonSync = auth?.enabled && auth?.ingelogd;
  const [toonAccount, setToonAccount] = useState(false);
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
        {auth?.enabled && (
          <button className="app-instellingen-btn" onClick={() => setToonAccount(true)} aria-label="Account">
            <IconAccount className="app-instellingen-icoon" />
          </button>
        )}
        <div className="app-instellingen-groep">
          <button className="app-instellingen-btn" onClick={() => setToonProfiel(true)} aria-label="Instellingen">
            <IconInstellingen className="app-instellingen-icoon" />
          </button>
          <span className="app-versie">{__APP_VERSION__}</span>
        </div>
      </div>
      {toonAccount && <AccountModal auth={auth} onClose={() => setToonAccount(false)} />}
      {toonProfiel && (
        <Modal titel="Profiel-instellingen" onClose={() => setToonProfiel(false)}>
          <ProfielInstellingenModal />
        </Modal>
      )}
    </header>
  );
}
