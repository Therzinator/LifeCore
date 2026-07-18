import { useState } from 'react';
import { useCardioSessies } from '../../hooks/useCardioSessies.js';
import { useCardioChecklist } from '../../hooks/useCardioChecklist.js';
import CardioChecklist from './CardioChecklist.jsx';
import CardioRegistreren from './CardioRegistreren.jsx';
import CardioHistorie from './CardioHistorie.jsx';
import CardioGroei from './CardioGroei.jsx';
import CardioRoeien from './CardioRoeien.jsx';
import './CardioPagina.css';

const TABS = [
  { id: 'vandaag', label: 'Vandaag' },
  { id: 'registreren', label: 'Registreren' },
  { id: 'historie', label: 'Historie' },
  { id: 'groei', label: 'Groeicurve' },
  { id: 'roeien', label: 'Roeioefening' },
];

export default function CardioPagina({ toonToast }) {
  const cardio = useCardioSessies();
  const checklist = useCardioChecklist();
  const [tab, setTab] = useState('vandaag');

  return (
    <div className="of-wrap">
      <div className="cp-tabs">
        {TABS.map((t) => (
          <button key={t.id} className={`cp-tab ${tab === t.id ? 'on' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="card">
        {tab === 'vandaag' && <CardioChecklist checklist={checklist} />}
        {tab === 'registreren' && <CardioRegistreren cardio={cardio} toonToast={toonToast} />}
        {tab === 'historie' && <CardioHistorie sessies={cardio.sessies} onVerwijder={cardio.verwijder} toonToast={toonToast} />}
        {tab === 'groei' && <CardioGroei sessies={cardio.sessies} />}
        {tab === 'roeien' && <CardioRoeien cardio={cardio} toonToast={toonToast} />}
      </div>
    </div>
  );
}
