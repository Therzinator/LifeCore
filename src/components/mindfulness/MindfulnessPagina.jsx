import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { useMindfulnessSessies } from '../../hooks/useMindfulnessSessies.js';
import { useMindfulnessGebruik } from '../../hooks/useMindfulnessGebruik.js';
import { useMindfulnessInstellingen } from '../../hooks/useMindfulnessInstellingen.js';
import { useVragenlijstGeschiedenis } from '../../hooks/useVragenlijstGeschiedenis.js';
import { useWelzijnInstellingen } from '../../hooks/useWelzijnInstellingen.js';
import { mindfulnessSuggestieActief } from '../../lib/welzijn/mindfulnessSignaal.js';
import { useRegistreerSubstap } from '../../contexts/SubstapContext.jsx';
import MindfulnessOefeningen from './MindfulnessOefeningen.jsx';
import SessieBrowser from './SessieBrowser.jsx';
import SessieSpeler from './SessieSpeler.jsx';
import MindfulnessProgressie from './MindfulnessProgressie.jsx';
import MindfulnessInstellingen from './MindfulnessInstellingen.jsx';
import ModuleInstellingenKnop from '../ui/ModuleInstellingenKnop.jsx';
import './MindfulnessPagina.css';

const TABS = [
  { id: 'oefeningen', label: 'Oefeningen' },
  { id: 'sessies', label: 'Sessies' },
  { id: 'progressie', label: 'Progressie' },
];

export default function MindfulnessPagina({ toonToast }) {
  const auth = useAuth();
  const { themas, sessies, laden: sessiesLaden } = useMindfulnessSessies();
  const { laden: gebruikLaden, voegToe, stats } = useMindfulnessGebruik(auth.user?.id);
  const { instellingen, bewaar: bewaarInstellingen } = useMindfulnessInstellingen();
  const welzijnGeschiedenis = useVragenlijstGeschiedenis('welzijn_check');
  const { instellingen: welzijnInstellingen } = useWelzijnInstellingen();
  const [tab, setTab] = useState('oefeningen');
  const [actieveSessie, setActieveSessie] = useState(null);

  const ingelogd = Boolean(auth.user?.id);
  const toonWelzijnSuggestie = mindfulnessSuggestieActief(welzijnGeschiedenis.afnames, welzijnInstellingen.mindfulnessImpactPct);
  useRegistreerSubstap(actieveSessie ? `Sessie: ${actieveSessie.titel}` : TABS.find((t) => t.id === tab)?.label);

  if (actieveSessie) {
    return (
      <div className="of-wrap">
        <div className="card">
          <SessieSpeler
            sessie={actieveSessie}
            onTerug={() => setActieveSessie(null)}
            voegGebruikToe={voegToe}
            sleeptimerStandaardDuur={instellingen.sleeptimerStandaardDuur}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="of-wrap">
      <div className="mik-kop-rij">
        <div className="mfp-tabs" style={{ flex: 1, minWidth: 0 }}>
          {TABS.map((t) => (
            <button key={t.id} className={`mfp-tab ${tab === t.id ? 'on' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        <ModuleInstellingenKnop titel="Mindfulness-instellingen">
          <MindfulnessInstellingen instellingen={instellingen} bewaar={bewaarInstellingen} />
        </ModuleInstellingenKnop>
      </div>

      {toonWelzijnSuggestie && tab === 'oefeningen' && (
        <div className="ad-banner warn">
          Je laatste burn-out &amp; herstel-check wees op verhoogde uitputting — een korte ademoefening kan nu net dat beetje ruimte geven.
        </div>
      )}

      <div className="card">
        {tab === 'oefeningen' && <MindfulnessOefeningen toonToast={toonToast} geluidFragment={instellingen.geluidFragment} />}
        {tab === 'sessies' && (
          <SessieBrowser
            themas={themas}
            sessies={sessies}
            laden={sessiesLaden}
            ingelogd={ingelogd}
            onKies={setActieveSessie}
          />
        )}
        {tab === 'progressie' && <MindfulnessProgressie stats={stats} laden={gebruikLaden} ingelogd={ingelogd} />}
      </div>
    </div>
  );
}
