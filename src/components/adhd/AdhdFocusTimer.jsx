import { useEffect, useRef, useState } from 'react';
import { useRustTimer } from '../../hooks/useRustTimer.js';
import TimerRing from '../ui/TimerRing.jsx';
import './AdhdFocusTimer.css';

const DUUR_OPTIES = [25, 45, 90];

function tijdLabel(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function AdhdFocusTimer({ actieveTaakTekst, blokAdvies, adhdDag, toonToast }) {
  const [duur, setDuur] = useState(blokAdvies || 25);
  const timer = useRustTimer(true);
  const verwerktRef = useRef(false);

  useEffect(() => {
    if (timer.actief) verwerktRef.current = false;
  }, [timer.actief]);

  useEffect(() => {
    if (!verwerktRef.current && timer.totaal > 0 && !timer.actief && timer.resterend === 0) {
      verwerktRef.current = true;
      adhdDag.voegFocusMinutenToe(duur);
      toonToast(`Focusblok voltooid — ${duur} minuten! Neem een korte pauze.`, 'ok');
    }
  }, [timer.actief, timer.resterend, timer.totaal, duur, adhdDag, toonToast]);

  function onderbreken() {
    timer.stop();
    adhdDag.voegPauzeToe();
    toonToast('Onderbroken — dat mag. Probeer morgen een volledig blok.', 'neu');
  }

  return (
    <div>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Focus-timer</div>
      {actieveTaakTekst ? (
        <p className="of-stap-tekst">🎯 {actieveTaakTekst}</p>
      ) : (
        <p className="of-stap-tekst">Kies een duur en start — kies eventueel eerst een taak op het Dashboard.</p>
      )}

      {!timer.actief && (
        <div className="aft-duur-rij">
          {DUUR_OPTIES.map((min) => (
            <button key={min} className={`aft-duur ${duur === min ? 'on' : ''}`} onClick={() => setDuur(min)}>{min} min</button>
          ))}
        </div>
      )}

      <div className="aft-ring-wrap">
        <TimerRing
          schaal={timer.actief ? 0.7 + 0.3 * (timer.resterend / timer.totaal) : 1}
          label={timer.actief ? 'Focusblok loopt' : 'Klaar?'}
          waarde={timer.actief ? tijdLabel(timer.resterend) : null}
        />
      </div>

      <div className="of-acties">
        {!timer.actief && <button className="btn btn-p btn-full" onClick={() => timer.start(duur * 60)}>Start focusblok</button>}
        {timer.actief && <button className="btn btn-text" onClick={onderbreken}>Onderbreken</button>}
      </div>
    </div>
  );
}
