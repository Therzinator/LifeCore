import { useState } from 'react';
import { useWerkTaken } from '../../hooks/useWerkTaken.js';
import { useWerkProjecten } from '../../hooks/useWerkProjecten.js';
import { useWerkInstellingen } from '../../hooks/useWerkInstellingen.js';
import { useAdhdDag } from '../../hooks/useAdhdDag.js';
import { useKlusboek } from '../../hooks/useKlusboek.js';
import { useAdhdInstellingen } from '../../hooks/useAdhdInstellingen.js';
import { useKruisSignalen } from '../../hooks/useKruisSignalen.js';
import { useRegistreerSubstap } from '../../contexts/SubstapContext.jsx';
import WerkTaken from './WerkTaken.jsx';
import WerkInstellingen from './WerkInstellingen.jsx';
import AdhdDashboard from '../adhd/AdhdDashboard.jsx';
import AdhdDagschema from '../adhd/AdhdDagschema.jsx';
import AdhdKlusboek from '../adhd/AdhdKlusboek.jsx';
import AdhdFocusTimer from '../adhd/AdhdFocusTimer.jsx';
import AdhdAfsluiten from '../adhd/AdhdAfsluiten.jsx';
import AdhdInstellingen from '../adhd/AdhdInstellingen.jsx';
import ModuleInstellingenKnop from '../ui/ModuleInstellingenKnop.jsx';
import './WerkPagina.css';

const TABS = [
  { id: 'taken', label: 'Taken' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'dagschema', label: 'Dagschema' },
  { id: 'klusboek', label: 'Klusboek' },
  { id: 'focus', label: 'Focus-timer' },
  { id: 'afsluiten', label: 'Afsluiten' },
];

// Huishouden, Kluslijst, Ontspullen en Boodschappen zijn verhuisd naar de
// Thuis-module (zie thuis/ThuisPagina.jsx) — Werk is nu de werk-taken van de
// dag, sámen met de vroegere losse Focus-module (dagplanning, focus-timer,
// afsluitritueel), die er sinds deze samenvoeging als tabblad onder valt
// (voorheen module-id 'adhd', zie git-geschiedenis). Eén gedeelde
// `werkTaken`-instantie voedt zowel de Taken-tab als alle Focus-tabs, zodat
// een taak afvinken (of afronden via een focusblok) overal hetzelfde
// betekent — voorheen had Focus zijn eigen, losse dagelijkse takenlijst die
// niets met de Werk-backlog te maken had, en moest je een taak na een
// focusblok apart bij Werk afvinken.
export default function WerkPagina({ toonToast, onNavigeer }) {
  const werkTaken = useWerkTaken();
  const werkProjecten = useWerkProjecten();
  const { instellingen, bewaar, voegCategorieToe, hernoemCategorie, verwijderCategorie } = useWerkInstellingen();
  const adhdDag = useAdhdDag();
  const klusboek = useKlusboek();
  const {
    instellingen: focusInstellingen, bewaar: bewaarFocusInstellingen, reset: resetFocusInstellingen,
  } = useAdhdInstellingen();
  const { focusMoetVerlagen } = useKruisSignalen({ focus: focusInstellingen.pasDaglimietAanBijUitputting });
  const [tab, setTab] = useState('taken');
  const [focusContext, setFocusContext] = useState({ taak: null, blokAdvies: null });
  useRegistreerSubstap(TABS.find((t) => t.id === tab)?.label);

  // Validatie hier i.p.v. binnen hernoemCategorie zelf, zodat de taken-migratie
  // alleen gebeurt als de naam ook echt is gewijzigd in de instellingen-lijst
  // (anders verweest een mislukte hernoeming — leeg/duplicaat — de taken toch).
  function hernoemCategorieOveral(oud, nieuw) {
    const schoon = nieuw.trim();
    if (!schoon || schoon === oud || instellingen.categorieen.includes(schoon)) return;
    hernoemCategorie(oud, schoon);
    werkTaken.hernoemCategorieOpTaken(oud, schoon);
  }

  // taak: het volledige Werk-taak-object (heeft een id, zie useWerkTaken.js)
  // als de focus-sessie op een bestaande taak start (Dashboard/Dagschema),
  // of null bij vrij starten vanuit de Focus-timer-tab zelf.
  function startFocus(taak, blokAdvies) {
    setFocusContext({ taak, blokAdvies });
    setTab('focus');
  }

  function resetFocusAlles() {
    adhdDag.wis();
    klusboek.wisAlles();
    resetFocusInstellingen();
    setTab('dashboard');
  }

  return (
    <div className="of-wrap">
      <div className="mik-kop-rij">
        <div className="wp-tabs" style={{ flex: 1, minWidth: 0 }}>
          {TABS.map((t) => (
            <button key={t.id} className={`wp-tab ${tab === t.id ? 'on' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        <ModuleInstellingenKnop titel="Werk-instellingen">
          <WerkInstellingen
            instellingen={instellingen}
            bewaar={bewaar}
            voegCategorieToe={voegCategorieToe}
            hernoemCategorie={hernoemCategorieOveral}
            verwijderCategorie={verwijderCategorie}
            werkProjecten={werkProjecten}
          />
        </ModuleInstellingenKnop>
        <ModuleInstellingenKnop titel="Focus-instellingen">
          <AdhdInstellingen
            instellingen={focusInstellingen}
            bewaar={bewaarFocusInstellingen}
            onResetAlles={resetFocusAlles}
            toonToast={toonToast}
          />
        </ModuleInstellingenKnop>
      </div>

      <div className="card">
        {tab === 'taken' && (
          <WerkTaken werkTaken={werkTaken} toonToast={toonToast} instellingen={instellingen} werkProjecten={werkProjecten} />
        )}
        {tab === 'dashboard' && (
          <AdhdDashboard
            adhdDag={adhdDag}
            werkTaken={werkTaken}
            instellingen={focusInstellingen}
            onStartFocus={startFocus}
            focusMoetVerlagen={focusMoetVerlagen}
          />
        )}
        {tab === 'dagschema' && (
          <AdhdDagschema
            adhdDag={adhdDag}
            instellingen={focusInstellingen}
            focusMoetVerlagen={focusMoetVerlagen}
            onStartFocus={startFocus}
            onNavigeer={onNavigeer}
          />
        )}
        {tab === 'klusboek' && <AdhdKlusboek klusboek={klusboek} werkTaken={werkTaken} toonToast={toonToast} />}
        {tab === 'focus' && (
          <AdhdFocusTimer
            actieveTaak={focusContext.taak}
            blokAdvies={focusContext.blokAdvies}
            adhdDag={adhdDag}
            werkTaken={werkTaken}
            geluidFragment={focusInstellingen.geluidFragment}
            toonToast={toonToast}
          />
        )}
        {tab === 'afsluiten' && <AdhdAfsluiten adhdDag={adhdDag} werkTaken={werkTaken} toonToast={toonToast} />}
      </div>
    </div>
  );
}
