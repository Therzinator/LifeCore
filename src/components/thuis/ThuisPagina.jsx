import { useState } from 'react';
import { useWerkTaken } from '../../hooks/useWerkTaken.js';
import { useHuishoudTaken } from '../../hooks/useHuishoudTaken.js';
import { useHuishoudProjecten } from '../../hooks/useHuishoudProjecten.js';
import { useHuishoudWeekschema } from '../../hooks/useHuishoudWeekschema.js';
import { useOntspullen } from '../../hooks/useOntspullen.js';
import { useBoodschappen } from '../../hooks/useBoodschappen.js';
import HuishoudTaken from '../werk/HuishoudTaken.jsx';
import HuishoudProjecten from '../werk/HuishoudProjecten.jsx';
import Ontspullen from '../werk/Ontspullen.jsx';
import Boodschappen from '../werk/Boodschappen.jsx';
import './ThuisPagina.css';

const TABS = [
  { id: 'huishouden', label: 'Huishouden' },
  { id: 'kluslijst', label: 'Kluslijst' },
  { id: 'ontspullen', label: 'Ontspullen' },
  { id: 'boodschappen', label: 'Boodschappen' },
];

// Huishouden, Kluslijst, Ontspullen en Boodschappen — voorheen tabbladen
// binnen Werk, nu een eigen module (zie modules.js): dit is de huiselijke
// kant van de dag, los van de werk-taken zelf. Instantieert hier zijn eigen
// useWerkTaken() (voor de gekoppelde-werktaken-weergave in Kluslijst) —
// veilig, want er is nooit meer dan één module tegelijk gemount (App.jsx
// rendert altijd precies één actieve pagina).
export default function ThuisPagina({ toonToast, userId, huishoudenId }) {
  const werkTaken = useWerkTaken();
  const huishoudTaken = useHuishoudTaken(huishoudenId, userId);
  const huishoudProjecten = useHuishoudProjecten(huishoudenId, userId);
  const weekschema = useHuishoudWeekschema(huishoudenId);
  const ontspullen = useOntspullen(huishoudenId, userId);
  const boodschappen = useBoodschappen(huishoudenId, userId);
  const [tab, setTab] = useState('huishouden');

  return (
    <div className="of-wrap">
      <div className="thp-tabs">
        {TABS.map((t) => (
          <button key={t.id} className={`thp-tab ${tab === t.id ? 'on' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="card">
        {tab === 'huishouden' && <HuishoudTaken huishoudTaken={huishoudTaken} weekschema={weekschema} toonToast={toonToast} />}
        {tab === 'kluslijst' && (
          <HuishoudProjecten
            projecten={huishoudProjecten}
            werkTaken={werkTaken}
            toonToast={toonToast}
            userId={userId}
            huishoudenId={huishoudenId}
          />
        )}
        {tab === 'ontspullen' && <Ontspullen ontspullen={ontspullen} toonToast={toonToast} />}
        {tab === 'boodschappen' && <Boodschappen boodschappen={boodschappen} toonToast={toonToast} />}
      </div>
    </div>
  );
}
