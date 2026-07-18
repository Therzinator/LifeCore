import { useState } from 'react';
import { useAdhdDag } from '../../hooks/useAdhdDag.js';
import { useKlusboek } from '../../hooks/useKlusboek.js';
import { useAdhdInstellingen } from '../../hooks/useAdhdInstellingen.js';
import { useAlgemeneInstellingen } from '../../hooks/useAlgemeneInstellingen.js';
import AdhdDashboard from './AdhdDashboard.jsx';
import AdhdKlusboek from './AdhdKlusboek.jsx';
import AdhdFocusTimer from './AdhdFocusTimer.jsx';
import AdhdAfsluiten from './AdhdAfsluiten.jsx';
import AdhdInstellingen from './AdhdInstellingen.jsx';
import './AdhdPagina.css';

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'klusboek', label: 'Klusboek' },
  { id: 'focus', label: 'Focus-timer' },
  { id: 'afsluiten', label: 'Afsluiten' },
  { id: 'instellingen', label: 'Instellingen' },
];

export default function AdhdPagina({ toonToast }) {
  const adhdDag = useAdhdDag();
  const klusboek = useKlusboek();
  const { instellingen, bewaar: bewaarInstellingen, reset: resetInstellingen } = useAdhdInstellingen();
  const { instellingen: algemeen } = useAlgemeneInstellingen();
  const [tab, setTab] = useState('dashboard');
  const [focusContext, setFocusContext] = useState({ taakTekst: null, blokAdvies: null });

  function startFocus(taakTekst, blokAdvies) {
    setFocusContext({ taakTekst, blokAdvies });
    setTab('focus');
  }

  function resetAlles() {
    adhdDag.wis();
    klusboek.wisAlles();
    resetInstellingen();
    setTab('dashboard');
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
        {tab === 'dashboard' && <AdhdDashboard adhdDag={adhdDag} instellingen={instellingen} onStartFocus={startFocus} />}
        {tab === 'klusboek' && <AdhdKlusboek klusboek={klusboek} adhdDag={adhdDag} toonToast={toonToast} />}
        {tab === 'focus' && (
          <AdhdFocusTimer
            actieveTaakTekst={focusContext.taakTekst}
            blokAdvies={focusContext.blokAdvies}
            adhdDag={adhdDag}
            geluidAan={algemeen.geluid.focus}
            toonToast={toonToast}
          />
        )}
        {tab === 'afsluiten' && <AdhdAfsluiten adhdDag={adhdDag} toonToast={toonToast} />}
        {tab === 'instellingen' && (
          <AdhdInstellingen instellingen={instellingen} bewaar={bewaarInstellingen} onResetAlles={resetAlles} toonToast={toonToast} />
        )}
      </div>
    </div>
  );
}
