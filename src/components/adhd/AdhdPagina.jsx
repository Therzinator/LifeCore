import { useState } from 'react';
import { useAdhdDag } from '../../hooks/useAdhdDag.js';
import { useKlusboek } from '../../hooks/useKlusboek.js';
import AdhdDashboard from './AdhdDashboard.jsx';
import AdhdKlusboek from './AdhdKlusboek.jsx';
import AdhdFocusTimer from './AdhdFocusTimer.jsx';
import AdhdAfsluiten from './AdhdAfsluiten.jsx';
import './AdhdPagina.css';

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'klusboek', label: 'Klusboek' },
  { id: 'focus', label: 'Focus-timer' },
  { id: 'afsluiten', label: 'Afsluiten' },
];

export default function AdhdPagina({ toonToast }) {
  const adhdDag = useAdhdDag();
  const klusboek = useKlusboek();
  const [tab, setTab] = useState('dashboard');
  const [focusContext, setFocusContext] = useState({ taakTekst: null, blokAdvies: null });

  function startFocus(taakTekst, blokAdvies) {
    setFocusContext({ taakTekst, blokAdvies });
    setTab('focus');
  }

  return (
    <div className="of-wrap">
      <div className="apg-tabs">
        {TABS.map((t) => (
          <button key={t.id} className={`apg-tab ${tab === t.id ? 'on' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="card">
        {tab === 'dashboard' && <AdhdDashboard adhdDag={adhdDag} onStartFocus={startFocus} />}
        {tab === 'klusboek' && <AdhdKlusboek klusboek={klusboek} adhdDag={adhdDag} toonToast={toonToast} />}
        {tab === 'focus' && (
          <AdhdFocusTimer
            actieveTaakTekst={focusContext.taakTekst}
            blokAdvies={focusContext.blokAdvies}
            adhdDag={adhdDag}
            toonToast={toonToast}
          />
        )}
        {tab === 'afsluiten' && <AdhdAfsluiten adhdDag={adhdDag} toonToast={toonToast} />}
      </div>
    </div>
  );
}
