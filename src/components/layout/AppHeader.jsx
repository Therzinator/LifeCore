import { useSync } from '../../hooks/useSync.js';
import './AppHeader.css';

const STATUS_LABEL = {
  lokaal: 'Lokaal',
  bezig: 'Synchroniseren...',
  gelukt: 'Gesynchroniseerd',
  mislukt: 'Mislukt',
};

export default function AppHeader({ auth }) {
  const sync = useSync(auth?.user?.id);
  const toonSync = auth?.enabled && auth?.ingelogd;

  return (
    <header className="app-header">
      <div className="app-brand">
        <span className="app-brand-dot" aria-hidden="true" />
        LifeCore
      </div>
      {toonSync && (
        <div className="app-sync">
          <span className={`sync-dot ${sync.status}`} aria-hidden="true" />
          <button className="app-sync-btn" onClick={sync.syncNu} disabled={sync.status === 'bezig'}>
            {STATUS_LABEL[sync.status]}
          </button>
        </div>
      )}
    </header>
  );
}
