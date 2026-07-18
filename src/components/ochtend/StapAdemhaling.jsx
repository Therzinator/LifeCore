import { useEffect, useRef, useState } from 'react';
import { faseOpTijdstip } from '../../lib/ochtend/ademhaling.js';
import OnderbouwingModal from '../ui/OnderbouwingModal.jsx';
import TimerRing from '../ui/TimerRing.jsx';
import './StapAdemhaling.css';

const FASE_LABEL = { inademen: 'Adem in', vasthouden: 'Vasthouden', uitademen: 'Adem uit' };

function schaalVoorFase(fase) {
  const voortgang = fase.secondenInFase / fase.duurFase;
  if (fase.naam === 'inademen') return 0.6 + 0.4 * voortgang;
  if (fase.naam === 'uitademen') return 1 - 0.4 * voortgang;
  return 1;
}

export default function StapAdemhaling({ dagdata, volgende, vorige, overslaan }) {
  const [gestart, setGestart] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [toonUitleg, setToonUitleg] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!gestart) return undefined;
    intervalRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(intervalRef.current);
  }, [gestart]);

  const fase = faseOpTijdstip(elapsed);

  function klaar() {
    dagdata.setAdemhalingGedaan();
    volgende();
  }

  return (
    <div>
      <div className="of-stap-titel">Adem even uit</div>
      <p className="of-stap-tekst">
        Inademen 4 tellen, vasthouden 4, uitademen 6. Doe zoveel cycli als je fijn vindt.
      </p>

      <button className="ad-link" onClick={() => setToonUitleg(true)}>
        Waarom werkt dit?
      </button>

      <div className="ad-ring-wrap">
        {gestart && <div className="ad-cyclus">Cyclus {fase.cyclusIndex + 1}</div>}
        <TimerRing
          schaal={gestart ? schaalVoorFase(fase) : 0.6}
          label={gestart ? FASE_LABEL[fase.naam] : 'Klaar?'}
          waarde={gestart ? fase.resterend + 1 : null}
        />
      </div>

      <div className="of-acties">
        {!gestart && <button className="btn btn-text" onClick={vorige}>Terug</button>}
        {!gestart && <button className="btn btn-text" onClick={overslaan}>Overslaan</button>}
        {!gestart && <button className="btn btn-p btn-full" onClick={() => setGestart(true)}>Start</button>}
        {gestart && <button className="btn btn-p btn-full" onClick={klaar}>Klaar</button>}
      </div>

      {toonUitleg && <OnderbouwingModal sleutel="ademhaling446" onClose={() => setToonUitleg(false)} />}
    </div>
  );
}
