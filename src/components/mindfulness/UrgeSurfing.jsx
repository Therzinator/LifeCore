import { useEffect, useState } from 'react';
import { URGE_STAPPEN } from '../../lib/mindfulness/urgeSurfing.js';
import { useSpraakVoorlezer } from '../../hooks/useSpraakVoorlezer.js';
import OnderbouwingModal from '../ui/OnderbouwingModal.jsx';
import HandsFreeKnop from '../ui/HandsFreeKnop.jsx';
import './UrgeSurfing.css';

const PAUZE_NA_STAP_MS = 4000;

export default function UrgeSurfing({ toonToast, onKlaar }) {
  const [stapIndex, setStapIndex] = useState(0);
  const [afgerond, setAfgerond] = useState(false);
  const [toonUitleg, setToonUitleg] = useState(false);
  const [handsFree, setHandsFree] = useState(false);
  const spraak = useSpraakVoorlezer();

  const stap = URGE_STAPPEN[stapIndex];
  const laatsteStap = stapIndex === URGE_STAPPEN.length - 1;
  const pct = Math.round((stapIndex / URGE_STAPPEN.length) * 100);

  function volgende() {
    if (!laatsteStap) {
      setStapIndex((i) => i + 1);
      return;
    }
    setAfgerond(true);
    toonToast?.('Urge surfing voltooid 🌊', 'ok');
  }

  // Hands-free: spreekt de huidige stap uit en schakelt vanzelf door — de
  // 'Adem'-stap krijgt via wachtNaMs extra ruimte om de ademcycli echt te
  // doen i.p.v. meteen door te schakelen. `geannuleerd` voorkomt een
  // stapel-overgang als hands-free tussentijds wordt uitgezet.
  useEffect(() => {
    if (!handsFree || afgerond) return undefined;
    let geannuleerd = false;
    let vervolgTimer = null;
    spraak.spreek(`${stap.fase}. ${stap.instructie} ${stap.detail}`, {
      onEinde: () => {
        if (geannuleerd) return;
        vervolgTimer = setTimeout(() => { if (!geannuleerd) volgende(); }, stap.wachtNaMs ?? PAUZE_NA_STAP_MS);
      },
    });
    return () => {
      geannuleerd = true;
      clearTimeout(vervolgTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- alleen bij hands-free-toggle of stap-overgang opnieuw uitspreken.
  }, [handsFree, stapIndex, afgerond]);

  useEffect(() => {
    if (!handsFree || !afgerond) return;
    spraak.spreek('Je hebt de golf doorstaan.');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handsFree, afgerond]);

  if (afgerond) {
    return (
      <div>
        <div className="us-klaar">
          <div className="us-klaar-icoon">🌊</div>
          <div className="us-klaar-titel">Klaar</div>
          <p className="of-stap-tekst">Je hebt de golf doorstaan. Elke keer dat je dit doet wordt het makkelijker.</p>
        </div>
        <div className="of-acties">
          <button className="btn btn-p btn-full" onClick={() => { spraak.stop(); onKlaar(); }}>Terug</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>🌊 Urge surfing</div>
      <p className="of-stap-tekst">Voor een drang — laat hem opkomen, pieken en vanzelf weer zakken.</p>
      <div className="sk-inline-rij">
        <button className="ad-link" onClick={() => setToonUitleg(true)}>Waarom werkt dit?</button>
        <HandsFreeKnop actief={handsFree} onToggle={() => setHandsFree((v) => !v)} beschikbaar={spraak.beschikbaar} />
      </div>

      <div className="us-voortgang-track"><div className="us-voortgang-fill" style={{ width: `${pct}%` }} /></div>

      <div className="us-kop">Stap {stapIndex + 1} van {URGE_STAPPEN.length} — {stap.fase}</div>
      <div className="us-instructie">{stap.instructie}</div>
      <div className="us-detail">{stap.detail}</div>

      <div className="of-acties">
        <button className="btn btn-text" onClick={() => { spraak.stop(); onKlaar(); }}>Stop</button>
        <button className="btn btn-p btn-full" onClick={volgende}>{laatsteStap ? 'Afronden ✓' : 'Volgende →'}</button>
      </div>

      {toonUitleg && <OnderbouwingModal sleutel="urgeSurfing" onClose={() => setToonUitleg(false)} />}
    </div>
  );
}
