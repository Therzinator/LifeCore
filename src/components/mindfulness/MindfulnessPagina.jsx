import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { useMindfulnessSessies } from '../../hooks/useMindfulnessSessies.js';
import { useMindfulnessGebruik } from '../../hooks/useMindfulnessGebruik.js';
import { useMindfulnessInstellingen } from '../../hooks/useMindfulnessInstellingen.js';
import MindfulnessOefeningen from './MindfulnessOefeningen.jsx';
import SessieBrowser from './SessieBrowser.jsx';
import SessieSpeler from './SessieSpeler.jsx';
import MindfulnessProgressie from './MindfulnessProgressie.jsx';
import MindfulnessInstellingen from './MindfulnessInstellingen.jsx';
import './MindfulnessPagina.css';

const TABS = [
  { id: 'oefeningen', label: 'Oefeningen' },
  { id: 'sessies', label: 'Sessies' },
  { id: 'progressie', label: 'Progressie' },
  { id: 'instellingen', label: 'Instellingen' },
];

export default function MindfulnessPagina({ toonToast, instellingenSignaal }) {
  const auth = useAuth();
  const { themas, sessies, laden: sessiesLaden } = useMindfulnessSessies();
  const { laden: gebruikLaden, voegToe, stats } = useMindfulnessGebruik(auth.user?.id);
  const { instellingen, bewaar: bewaarInstellingen } = useMindfulnessInstellingen();
  const [tab, setTab] = useState('oefeningen');
  const [actieveSessie, setActieveSessie] = useState(null);

  useEffect(() => {
    if (instellingenSignaal) setTab('instellingen');
  }, [instellingenSignaal]);

  const ingelogd = Boolean(auth.user?.id);

  if (actieveSessie) {
    return (
      <div className="of-wrap">
        <div className="card">
          <SessieSpeler sessie={actieveSessie} onTerug={() => setActieveSessie(null)} voegGebruikToe={voegToe} />
        </div>
      </div>
    );
  }

  return (
    <div className="of-wrap">
      <div className="mfp-tabs">
        {TABS.map((t) => (
          <button key={t.id} className={`mfp-tab ${tab === t.id ? 'on' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

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
        {tab === 'instellingen' && <MindfulnessInstellingen instellingen={instellingen} bewaar={bewaarInstellingen} />}
      </div>
    </div>
  );
}
