import { useEffect, useRef, useState } from 'react';
import { faseOpTijdstip } from '../../lib/ochtend/ademhaling.js';
import { OCHTEND_ADEMHALING_AUDIO_PAD } from '../../lib/geluid/meditatieAudio.js';
import { useSpraakVoorlezer } from '../../hooks/useSpraakVoorlezer.js';
import { useMeditatieAudioSpeler } from '../../hooks/useMeditatieAudioSpeler.js';
import OnderbouwingModal from '../ui/OnderbouwingModal.jsx';
import TimerRing from '../ui/TimerRing.jsx';
import HandsFreeKnop from '../ui/HandsFreeKnop.jsx';
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
  const [handsFree, setHandsFree] = useState(false);
  const [audioAan, setAudioAan] = useState(false);
  const intervalRef = useRef(null);
  const meditatieAudioRef = useRef(null);
  const spraak = useSpraakVoorlezer();

  useEffect(() => {
    if (!gestart) return undefined;
    intervalRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(intervalRef.current);
  }, [gestart]);

  useMeditatieAudioSpeler(meditatieAudioRef, { actief: gestart, audioAan, pad: OCHTEND_ADEMHALING_AUDIO_PAD });

  const fase = faseOpTijdstip(elapsed);

  useEffect(() => {
    if (!handsFree || !gestart) return;
    spraak.spreek(FASE_LABEL[fase.naam]);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- alleen bij een fase-overgang uitspreken, niet bij elke seconde-tick.
  }, [handsFree, gestart, fase.naam]);

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

      <div className="sk-inline-rij">
        <button className="ad-link" onClick={() => setToonUitleg(true)}>
          Waarom werkt dit?
        </button>
        <HandsFreeKnop actief={handsFree} onToggle={() => setHandsFree((v) => !v)} beschikbaar={spraak.beschikbaar} />
      </div>

      {!gestart && (
        <button
          type="button"
          className={`btn btn-sm ${audioAan ? 'btn-p' : 'btn-g'}`}
          style={{ marginBottom: 'var(--space-sm)' }}
          onClick={() => setAudioAan((v) => !v)}
        >
          {audioAan ? '🔊 Meditatie-audio aan' : '🔇 Meditatie-audio uit'}
        </button>
      )}
      <audio ref={meditatieAudioRef} preload="none" />

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
