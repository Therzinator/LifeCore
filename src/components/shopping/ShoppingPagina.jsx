import { useState } from 'react';
import { useBoodschappen } from '../../hooks/useBoodschappen.js';
import { useGerechten } from '../../hooks/useGerechten.js';
import { useRegistreerSubstap } from '../../contexts/SubstapContext.jsx';
import Boodschappen from './Boodschappen.jsx';
import Gerechten from './Gerechten.jsx';
import '../thuis/ThuisPagina.css';

const TABS = [
  { id: 'boodschappen', label: 'Boodschappen' },
  { id: 'gerechten', label: 'Gerechten' },
];

// Boodschappen en Gerechten — voorheen tabbladen binnen Thuis, nu een eigen
// module (zie modules.js): boodschappen doen/plannen is geen huishoudelijke
// klus, dus verdient een eigen plek los van Kluslijst/Huishouden/Tuinieren.
export default function ShoppingPagina({ toonToast, userId, huishoudenId }) {
  const boodschappen = useBoodschappen(huishoudenId, userId);
  const gerechten = useGerechten(huishoudenId, userId);
  const [tab, setTab] = useState('boodschappen');
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
        {tab === 'boodschappen' && <Boodschappen boodschappen={boodschappen} toonToast={toonToast} />}
        {tab === 'gerechten' && <Gerechten gerechten={gerechten} boodschappen={boodschappen} toonToast={toonToast} />}
      </div>
    </div>
  );
}
