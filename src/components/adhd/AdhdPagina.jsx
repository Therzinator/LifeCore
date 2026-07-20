import { useState } from 'react';
import { useAdhdDag } from '../../hooks/useAdhdDag.js';
import { useKlusboek } from '../../hooks/useKlusboek.js';
import { useAdhdInstellingen } from '../../hooks/useAdhdInstellingen.js';
import { useKruisSignalen } from '../../hooks/useKruisSignalen.js';
import AdhdDashboard from './AdhdDashboard.jsx';
import AdhdDagschema from './AdhdDagschema.jsx';
import AdhdKlusboek from './AdhdKlusboek.jsx';
import AdhdFocusTimer from './AdhdFocusTimer.jsx';
import AdhdAfsluiten from './AdhdAfsluiten.jsx';
import AdhdInstellingen from './AdhdInstellingen.jsx';
import ModuleInstellingenKnop from '../ui/ModuleInstellingenKnop.jsx';
import { useRegistreerSubstap } from '../../contexts/SubstapContext.jsx';
import './AdhdPagina.css';

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'dagschema', label: 'Dagschema' },
  { id: 'klusboek', label: 'Klusboek' },
  { id: 'focus', label: 'Focus-timer' },
  { id: 'afsluiten', label: 'Afsluiten' },
];

export default function AdhdPagina({ toonToast, onNavigeer, userId, huishoudenId }) {
  const adhdDag = useAdhdDag();
  const klusboek = useKlusboek();
  const { instellingen, bewaar: bewaarInstellingen, reset: resetInstellingen } = useAdhdInstellingen();
  const { focusMoetVerlagen } = useKruisSignalen({ focus: instellingen.pasDaglimietAanBijUitputting });
  const [tab, setTab] = useState('dashboard');
  const [focusContext, setFocusContext] = useState({ taakTekst: null, blokAdvies: null });
  useRegistreerSubstap(TABS.find((t) => t.id === tab)?.label);

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
      <div className="mik-kop-rij">
        <div className="apg-tabs" style={{ flex: 1, minWidth: 0 }}>
          {TABS.map((t) => (
            <button key={t.id} className={`apg-tab ${tab === t.id ? 'on' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        <ModuleInstellingenKnop titel="Focus-instellingen">
          <AdhdInstellingen instellingen={instellingen} bewaar={bewaarInstellingen} onResetAlles={resetAlles} toonToast={toonToast} />
        </ModuleInstellingenKnop>
      </div>

      <div className="card">
        {tab === 'dashboard' && (
          <AdhdDashboard adhdDag={adhdDag} instellingen={instellingen} onStartFocus={startFocus} focusMoetVerlagen={focusMoetVerlagen} />
        )}
        {tab === 'dagschema' && (
          <AdhdDagschema
            adhdDag={adhdDag}
            instellingen={instellingen}
            focusMoetVerlagen={focusMoetVerlagen}
            onStartFocus={startFocus}
            onNavigeer={onNavigeer}
            userId={userId}
            huishoudenId={huishoudenId}
          />
        )}
        {tab === 'klusboek' && <AdhdKlusboek klusboek={klusboek} adhdDag={adhdDag} toonToast={toonToast} />}
        {tab === 'focus' && (
          <AdhdFocusTimer
            actieveTaakTekst={focusContext.taakTekst}
            blokAdvies={focusContext.blokAdvies}
            adhdDag={adhdDag}
            geluidFragment={instellingen.geluidFragment}
            toonToast={toonToast}
          />
        )}
        {tab === 'afsluiten' && <AdhdAfsluiten adhdDag={adhdDag} toonToast={toonToast} />}
      </div>
    </div>
  );
}
