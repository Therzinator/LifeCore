import { useEffect, useRef, useState } from 'react';
import { PMR_SPIEREN, faseOpTijdstip } from '../../lib/mindfulness/pmr.js';
import OnderbouwingModal from '../ui/OnderbouwingModal.jsx';
import TimerRing from '../ui/TimerRing.jsx';
import './SpierontspanningOefening.css';

const FASE_LABEL = { span: 'Span aan', los: 'Laat los' };

export default function SpierontspanningOefening({ onKlaar }) {
  const [gestart, setGestart] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [toonUitleg, setToonUitleg] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!gestart) return undefined;
    intervalRef.current = setInterval(() => {
      setElapsed((s) => {
        const volgende = s + 1;
        if (faseOpTijdstip(volgende) === null) clearInterval(intervalRef.current);
        return volgende;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [gestart]);

  const fase = gestart ? faseOpTijdstip(elapsed) : null;
  const klaarMetOefening = gestart && fase === null;

  return (
    <div>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Spierontspanning</div>
      <p className="of-stap-tekst">
        Span elke spiergroep 5 seconden aan — dan 10 seconden volledig loslaten. Voel het verschil.
      </p>

      <button className="ad-link" onClick={() => setToonUitleg(true)}>Waarom werkt dit?</button>

      {!gestart && (
        <div className="of-acties">
          <button className="btn btn-text" onClick={onKlaar}>Terug</button>
          <button className="btn btn-p btn-full" onClick={() => setGestart(true)}>Start</button>
        </div>
      )}

      {gestart && !klaarMetOefening && fase && (
        <>
          <TimerRing
            schaal={1}
            label={FASE_LABEL[fase.fase]}
            waarde={fase.resterend + 1}
            variant={fase.fase === 'span' ? 'warn' : 'accent'}
          />
          <div className="pmr-lijst">
            {PMR_SPIEREN.map((groep, i) => (
              <div className={`pmr-item ${i === fase.spierIndex ? 'actief' : ''}`} key={groep.naam}>
                <div className="pmr-nr">{i + 1}</div>
                <div>
                  <div className="pmr-naam">{groep.naam}</div>
                  <div className="pmr-instructie">{groep.instructie}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {klaarMetOefening && (
        <div>
          <p className="of-stap-tekst">Goed gedaan. Merk het verschil tussen spanning en ontspanning.</p>
          <div className="of-acties">
            <button className="btn btn-p btn-full" onClick={onKlaar}>Terug naar overzicht</button>
          </div>
        </div>
      )}

      {toonUitleg && <OnderbouwingModal sleutel="pmrSpierontspanning" onClose={() => setToonUitleg(false)} />}
    </div>
  );
}
