import { useState } from 'react';
import { useWerkTaken } from '../../hooks/useWerkTaken.js';
import { useHuishoudTaken } from '../../hooks/useHuishoudTaken.js';
import { useHuishoudProjecten } from '../../hooks/useHuishoudProjecten.js';
import { useWerkInstellingen } from '../../hooks/useWerkInstellingen.js';
import WerkTaken from './WerkTaken.jsx';
import HuishoudTaken from './HuishoudTaken.jsx';
import WerkInstellingen from './WerkInstellingen.jsx';
import ModuleInstellingenKnop from '../ui/ModuleInstellingenKnop.jsx';
import './WerkPagina.css';

const TABS = [
  { id: 'werk', label: 'Werktaken' },
  { id: 'huishouden', label: 'Huishouden' },
];

export default function WerkPagina({ toonToast }) {
  const werkTaken = useWerkTaken();
  const huishoudTaken = useHuishoudTaken();
  const huishoudProjecten = useHuishoudProjecten();
  const { instellingen, bewaar, voegCategorieToe, verwijderCategorie } = useWerkInstellingen();
  const [tab, setTab] = useState('werk');

  return (
    <div className="of-wrap">
      <div className="mik-kop-rij">
        <div className="wkp-tabs" style={{ flex: 1, minWidth: 0 }}>
          {TABS.map((t) => (
            <button key={t.id} className={`wkp-tab ${tab === t.id ? 'on' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        <ModuleInstellingenKnop titel="Werk-instellingen">
          <WerkInstellingen
            instellingen={instellingen}
            bewaar={bewaar}
            voegCategorieToe={voegCategorieToe}
            verwijderCategorie={verwijderCategorie}
          />
        </ModuleInstellingenKnop>
      </div>

      <div className="card">
        {tab === 'werk' && <WerkTaken werkTaken={werkTaken} toonToast={toonToast} instellingen={instellingen} />}
        {tab === 'huishouden' && (
          <HuishoudTaken huishoudTaken={huishoudTaken} huishoudProjecten={huishoudProjecten} toonToast={toonToast} />
        )}
      </div>
    </div>
  );
}
