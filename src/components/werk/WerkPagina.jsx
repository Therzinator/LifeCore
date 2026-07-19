import { useState } from 'react';
import { useWerkTaken } from '../../hooks/useWerkTaken.js';
import { useHuishoudTaken } from '../../hooks/useHuishoudTaken.js';
import { useHuishoudProjecten } from '../../hooks/useHuishoudProjecten.js';
import { useHuishoudWeekschema } from '../../hooks/useHuishoudWeekschema.js';
import { useOntspullen } from '../../hooks/useOntspullen.js';
import { useBoodschappen } from '../../hooks/useBoodschappen.js';
import { useWerkInstellingen } from '../../hooks/useWerkInstellingen.js';
import WerkTaken from './WerkTaken.jsx';
import HuishoudTaken from './HuishoudTaken.jsx';
import HuishoudProjecten from './HuishoudProjecten.jsx';
import Ontspullen from './Ontspullen.jsx';
import Boodschappen from './Boodschappen.jsx';
import WerkInstellingen from './WerkInstellingen.jsx';
import ModuleInstellingenKnop from '../ui/ModuleInstellingenKnop.jsx';
import './WerkPagina.css';

const TABS = [
  { id: 'werk', label: 'Werktaken' },
  { id: 'huishouden', label: 'Huishouden' },
  { id: 'kluslijst', label: 'Kluslijst' },
  { id: 'ontspullen', label: 'Ontspullen' },
  { id: 'boodschappen', label: 'Boodschappen' },
];

export default function WerkPagina({ toonToast, userId }) {
  const werkTaken = useWerkTaken();
  const huishoudTaken = useHuishoudTaken();
  const huishoudProjecten = useHuishoudProjecten();
  const weekschema = useHuishoudWeekschema();
  const ontspullen = useOntspullen();
  const boodschappen = useBoodschappen();
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
        {tab === 'werk' && (
          <WerkTaken werkTaken={werkTaken} toonToast={toonToast} instellingen={instellingen} huishoudProjecten={huishoudProjecten} />
        )}
        {tab === 'huishouden' && <HuishoudTaken huishoudTaken={huishoudTaken} weekschema={weekschema} toonToast={toonToast} />}
        {tab === 'kluslijst' && (
          <HuishoudProjecten projecten={huishoudProjecten} werkTaken={werkTaken} toonToast={toonToast} userId={userId} />
        )}
        {tab === 'ontspullen' && <Ontspullen ontspullen={ontspullen} toonToast={toonToast} />}
        {tab === 'boodschappen' && <Boodschappen boodschappen={boodschappen} toonToast={toonToast} />}
      </div>
    </div>
  );
}
