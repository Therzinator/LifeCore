import { useEffect, useRef, useState } from 'react';
import { faseOpTijdstip } from '../../lib/mindfulness/meditatie.js';
import { speelFragment } from '../../lib/geluid/fragmenten.js';
import { MEDITATIE_AUDIO_PAD } from '../../lib/geluid/meditatieAudio.js';
import { useSpraakVoorlezer } from '../../hooks/useSpraakVoorlezer.js';
import { useMeditatieAudioSpeler } from '../../hooks/useMeditatieAudioSpeler.js';
import OnderbouwingModal from '../ui/OnderbouwingModal.jsx';
import TimerRing from '../ui/TimerRing.jsx';
import HandsFreeKnop from '../ui/HandsFreeKnop.jsx';
import './AdemMeditatie.css';

const FASE_LABEL = { inademen: 'Adem in', uitademen: 'Adem uit' };
const DUUR_OPTIES = [3, 5, 10];

function schaalVoorFase(fase) {
  const voortgang = fase.secondenInFase / fase.duurFase;
  return fase.naam === 'inademen' ? 0.6 + 0.4 * voortgang : 1 - 0.4 * voortgang;
}

export default function AdemMeditatie({ geluidFragment, onKlaar }) {
  const [duurMinuten, setDuurMinuten] = useState(5);
  const [gestart, setGestart] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [toonUitleg, setToonUitleg] = useState(false);
  const [handsFree, setHandsFree] = useState(false);
  const [audioAan, setAudioAan] = useState(false);
  const intervalRef = useRef(null);
  const geluidGespeeldRef = useRef(false);
  const meditatieAudioRef = useRef(null);
  const spraak = useSpraakVoorlezer();

  const totaleSeconden = duurMinuten * 60;
  const klaar = gestart && elapsed >= totaleSeconden;

  useMeditatieAudioSpeler(meditatieAudioRef, {
    actief: gestart && !klaar, audioAan, pad: MEDITATIE_AUDIO_PAD[duurMinuten],
  });

  useEffect(() => {
    if (!gestart || klaar) return undefined;
    intervalRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(intervalRef.current);
  }, [gestart, klaar]);

  useEffect(() => {
    if (!klaar || geluidGespeeldRef.current) return;
    geluidGespeeldRef.current = true;
    speelFragment(geluidFragment);
  }, [klaar, geluidFragment]);

  const fase = gestart && !klaar ? faseOpTijdstip(elapsed) : null;
  const resterendTotaal = Math.max(totaleSeconden - elapsed, 0);

  useEffect(() => {
    if (!handsFree || !fase) return;
    spraak.spreek(FASE_LABEL[fase.naam]);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- alleen bij een fase-overgang uitspreken, niet bij elke seconde-tick.
  }, [handsFree, fase?.naam]);

  useEffect(() => {
    if (!handsFree || !klaar) return;
    spraak.spreek('Fijn gedaan.');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handsFree, klaar]);

  return (
    <div>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Ademmeditatie</div>
      <p className="of-stap-tekst">Rustig ademen, geen prestatie. Stop wanneer je wilt.</p>

      <div className="sk-inline-rij">
        <button className="ad-link" onClick={() => setToonUitleg(true)}>Waarom werkt dit?</button>
        <HandsFreeKnop actief={handsFree} onToggle={() => setHandsFree((v) => !v)} beschikbaar={spraak.beschikbaar} />
      </div>

      {!gestart && (
        <>
          <div className="am-duur-kies">
            {DUUR_OPTIES.map((min) => (
              <button
                key={min}
                className={`am-duur-optie ${duurMinuten === min ? 'on' : ''}`}
                onClick={() => setDuurMinuten(min)}
              >
                {min} min
              </button>
            ))}
          </div>
          <button
            type="button"
            className={`btn btn-sm ${audioAan ? 'btn-p' : 'btn-g'}`}
            style={{ marginBottom: 'var(--space-sm)' }}
            onClick={() => setAudioAan((v) => !v)}
          >
            {audioAan ? '🔊 Meditatie-audio aan' : '🔇 Meditatie-audio uit'}
          </button>
          <div className="of-acties">
            <button className="btn btn-text" onClick={onKlaar}>Terug</button>
            <button className="btn btn-p btn-full" onClick={() => setGestart(true)}>Start</button>
          </div>
        </>
      )}

      <audio ref={meditatieAudioRef} preload="none" />

      {gestart && !klaar && fase && (
        <>
          <div className="am-resterend">Nog {Math.ceil(resterendTotaal / 60)} min</div>
          <TimerRing schaal={schaalVoorFase(fase)} label={FASE_LABEL[fase.naam]} waarde={null} />
          <div className="of-acties">
            <button className="btn btn-g btn-full" onClick={onKlaar}>Stoppen</button>
          </div>
        </>
      )}

      {klaar && (
        <div>
          <p className="of-stap-tekst">Fijn gedaan. Neem gerust nog even de tijd voor je verdergaat.</p>
          <div className="of-acties">
            <button className="btn btn-p btn-full" onClick={onKlaar}>Terug naar overzicht</button>
          </div>
        </div>
      )}

      {toonUitleg && <OnderbouwingModal sleutel="ademMeditatie" onClose={() => setToonUitleg(false)} />}
    </div>
  );
}
