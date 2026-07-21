import { useState } from 'react';
import { useHuishoudTaken } from '../../hooks/useHuishoudTaken.js';
import { useTuinTaken } from '../../hooks/useTuinTaken.js';
import { useHuishoudProjecten } from '../../hooks/useHuishoudProjecten.js';
import { useHuishoudWeekschema } from '../../hooks/useHuishoudWeekschema.js';
import { useOntspullen } from '../../hooks/useOntspullen.js';
import { useRegistreerSubstap } from '../../contexts/SubstapContext.jsx';
import HuishoudTaken from '../werk/HuishoudTaken.jsx';
import TuinTaken from './TuinTaken.jsx';
import HuishoudProjecten from '../werk/HuishoudProjecten.jsx';
import Ontspullen from '../werk/Ontspullen.jsx';
import './ThuisPagina.css';

const TABS = [
  { id: 'huishouden', label: 'Huishouden' },
  { id: 'tuinieren', label: 'Tuinieren' },
  { id: 'kluslijst', label: 'Kluslijst' },
  { id: 'ontspullen', label: 'Ontspullen' },
];

// Huishouden, Kluslijst en Ontspullen — voorheen tabbladen binnen Werk, nu
// een eigen module (zie modules.js): dit is de huiselijke kant van de dag,
// los van de werk-taken zelf (Kluslijst heeft geen koppeling meer met
// Werk-taken — zie useWerkProjecten.js). Boodschappen en Gerechten zijn
// inmiddels zelf ook los getrokken naar de Shopping-module.
export default function ThuisPagina({ toonToast, userId, huishoudenId }) {
  const huishoudTaken = useHuishoudTaken(huishoudenId, userId);
  const tuinTaken = useTuinTaken(huishoudenId, userId);
  const huishoudProjecten = useHuishoudProjecten(huishoudenId, userId);
  const weekschema = useHuishoudWeekschema(huishoudenId);
  const ontspullen = useOntspullen(huishoudenId, userId);
  const [tab, setTab] = useState('huishouden');
  useRegistreerSubstap(TABS.find((t) => t.id === tab)?.label);

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
        {tab === 'tuinieren' && <TuinTaken tuinTaken={tuinTaken} toonToast={toonToast} />}
        {tab === 'kluslijst' && (
          <HuishoudProjecten
            projecten={huishoudProjecten}
            toonToast={toonToast}
            userId={userId}
            huishoudenId={huishoudenId}
          />
        )}
        {tab === 'ontspullen' && <Ontspullen ontspullen={ontspullen} toonToast={toonToast} />}
      </div>
    </div>
  );
}
