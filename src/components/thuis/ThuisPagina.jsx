import { useState } from 'react';
import { useHuishoudTaken } from '../../hooks/useHuishoudTaken.js';
import { useTuinTaken } from '../../hooks/useTuinTaken.js';
import { useHuishoudProjecten } from '../../hooks/useHuishoudProjecten.js';
import { useHuishoudWeekschema } from '../../hooks/useHuishoudWeekschema.js';
import { useOntspullen } from '../../hooks/useOntspullen.js';
import { useAgendaBlokken } from '../../hooks/useAgendaBlokken.js';
import { cyclusStartDatum } from '../../lib/werk/huishoudPeriode.js';
import { pasTijdAan } from '../../lib/agenda/agendaBlokken.js';
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
  const blokken = useAgendaBlokken();
  const [tab, setTab] = useState('huishouden');
  useRegistreerSubstap(TABS.find((t) => t.id === tab)?.label);

  // 'Standaard in agenda' geldt alleen voor taken met een eigen interval
  // (frequentie 'aangepast') — wekelijkse taken hebben al een eigen,
  // per-week-herwijsbare dag via het weekschema (zie HuishoudTaken.jsx);
  // een los, permanent-herhalend blok zou daarmee uit de pas gaan lopen
  // zodra de weekschema-dag verandert. Het herhalende blok krijgt hetzelfde
  // bronId als de taak, waardoor 'm precies één keer bestaat (aan/uit is dus
  // gewoon 'blok met dit bronId aanwezig of niet').
  const standaardInAgendaIds = new Set(
    blokken.blokken.filter((b) => b.herhaling?.type === 'interval' && b.bronId).map((b) => b.bronId),
  );

  function zetStandaardInAgenda(taak, aan) {
    const bestaandBlok = blokken.blokken.find((b) => b.bronId === taak.id && b.herhaling?.type === 'interval');
    if (!aan) {
      if (bestaandBlok) blokken.verwijder(bestaandBlok.id);
      return;
    }
    if (bestaandBlok) return;
    const duur = (taak.geschatteUren ?? 0.5) * 60;
    const starttijd = '10:00';
    blokken.voegToe({
      titel: taak.tekst, type: 'huishouden', datum: cyclusStartDatum(taak.intervalDagen),
      starttijd, eindtijd: pasTijdAan(starttijd, duur),
      herhaling: { type: 'interval', dagen: taak.intervalDagen }, bronId: taak.id,
    });
  }

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
        {tab === 'huishouden' && (
          <HuishoudTaken
            huishoudTaken={huishoudTaken}
            weekschema={weekschema}
            toonToast={toonToast}
            standaardInAgendaIds={standaardInAgendaIds}
            onZetStandaardInAgenda={zetStandaardInAgenda}
          />
        )}
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
