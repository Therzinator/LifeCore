import { useState } from 'react';
import { useWerkTaken } from '../../hooks/useWerkTaken.js';
import { useHuishoudTaken } from '../../hooks/useHuishoudTaken.js';
import WerkTaken from './WerkTaken.jsx';
import HuishoudTaken from './HuishoudTaken.jsx';
import './WerkPagina.css';

const TABS = [
  { id: 'werk', label: 'Werktaken' },
  { id: 'huishouden', label: 'Huishouden' },
];

export default function WerkPagina({ toonToast }) {
  const werkTaken = useWerkTaken();
  const huishoudTaken = useHuishoudTaken();
  const [tab, setTab] = useState('werk');

  return (
    <div className="of-wrap">
      <div className="wkp-tabs">
        {TABS.map((t) => (
          <button key={t.id} className={`wkp-tab ${tab === t.id ? 'on' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="card">
        {tab === 'werk' && <WerkTaken werkTaken={werkTaken} toonToast={toonToast} />}
        {tab === 'huishouden' && <HuishoudTaken huishoudTaken={huishoudTaken} toonToast={toonToast} />}
      </div>
    </div>
  );
}
