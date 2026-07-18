import { useEffect, useRef, useState } from 'react';
import { audioUrl } from '../../lib/supabase/mindfulness.js';
import OnderbouwingModal from '../ui/OnderbouwingModal.jsx';
import './SessieSpeler.css';

const SLEEPTIMER_OPTIES = [10, 20, 30, 45];
const FADE_SECONDEN = 10;

function tijdLabel(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function SessieSpeler({ sessie, onTerug, voegGebruikToe }) {
  const audioRef = useRef(null);
  const gelogdRef = useRef(false);
  const sleeptimerRef = useRef(null);

  const [spelen, setSpelen] = useState(false);
  const [huidigeTijd, setHuidigeTijd] = useState(0);
  const [duur, setDuur] = useState(sessie.duur_seconden);
  const [sleeptimerMin, setSleeptimerMin] = useState(null);
  const [sleeptimerResterend, setSleeptimerResterend] = useState(null);
  const [toonUitleg, setToonUitleg] = useState(false);

  const bron = audioUrl(sessie.audio_pad);

  function logHuidigeVoortgang(voltooid) {
    if (gelogdRef.current) return;
    gelogdRef.current = true;
    const sec = Math.round(audioRef.current?.currentTime ?? huidigeTijd);
    voegGebruikToe(sessie.id, sec, voltooid);
  }

  useEffect(() => {
    if (!navigator.mediaSession) return;
    navigator.mediaSession.metadata = new window.MediaMetadata({
      title: sessie.titel,
      artist: 'LifeCore — Mindfulness',
    });
    navigator.mediaSession.setActionHandler('play', () => audioRef.current?.play());
    navigator.mediaSession.setActionHandler('pause', () => audioRef.current?.pause());
    return () => {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
    };
  }, [sessie]);

  useEffect(() => () => {
    // Sessie verlaten zonder dat de audio natuurlijk afliep — log wat beluisterd is.
    logHuidigeVoortgang(false);
    clearInterval(sleeptimerRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function wisselAfspelen() {
    const el = audioRef.current;
    if (!el) return;
    if (spelen) el.pause(); else el.play();
  }

  function zetSleeptimer(minuten) {
    clearInterval(sleeptimerRef.current);
    if (minuten === null) {
      setSleeptimerMin(null);
      setSleeptimerResterend(null);
      if (audioRef.current) audioRef.current.volume = 1;
      return;
    }
    setSleeptimerMin(minuten);
    let resterend = minuten * 60;
    setSleeptimerResterend(resterend);
    sleeptimerRef.current = setInterval(() => {
      resterend -= 1;
      setSleeptimerResterend(resterend);
      const el = audioRef.current;
      if (el && resterend <= FADE_SECONDEN && resterend > 0) {
        el.volume = Math.max(0, resterend / FADE_SECONDEN);
      }
      if (resterend <= 0) {
        clearInterval(sleeptimerRef.current);
        if (el) { el.pause(); el.volume = 1; }
        setSleeptimerMin(null);
        setSleeptimerResterend(null);
      }
    }, 1000);
  }

  const voortgangPct = duur ? Math.round((huidigeTijd / duur) * 100) : 0;

  return (
    <div>
      <button className="btn btn-text" onClick={() => { logHuidigeVoortgang(false); onTerug(); }}>← Terug</button>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>{sessie.titel}</div>
      <button className="ad-link" onClick={() => setToonUitleg(true)}>Waarom werkt dit?</button>

      <audio
        ref={audioRef}
        src={bron ?? undefined}
        preload="metadata"
        onPlay={() => setSpelen(true)}
        onPause={() => setSpelen(false)}
        onLoadedMetadata={(e) => setDuur(e.currentTarget.duration || sessie.duur_seconden)}
        onTimeUpdate={(e) => setHuidigeTijd(e.currentTarget.currentTime)}
        onEnded={() => { setSpelen(false); logHuidigeVoortgang(true); }}
      />

      <div className="ss-speler card">
        <div className="ss-tijd-rij">
          <span>{tijdLabel(huidigeTijd)}</span>
          <span>{tijdLabel(duur)}</span>
        </div>
        <input
          className="ss-seek"
          type="range"
          min="0"
          max={duur || 0}
          step="1"
          value={huidigeTijd}
          onChange={(e) => { if (audioRef.current) audioRef.current.currentTime = Number(e.target.value); }}
        />
        <button className="ss-play-btn" onClick={wisselAfspelen} aria-label={spelen ? 'Pauzeer' : 'Speel af'}>
          {spelen ? '⏸' : '▶'}
        </button>
        <div className="ss-voortgang-track"><div className="ss-voortgang-fill" style={{ width: `${voortgangPct}%` }} /></div>
      </div>

      <div className="card">
        <div className="td-label">Sleeptimer</div>
        <div className="ss-sleeptimer-rij">
          <button className={`btn btn-sm ${sleeptimerMin === null ? 'btn-p' : 'btn-g'}`} onClick={() => zetSleeptimer(null)}>Uit</button>
          {SLEEPTIMER_OPTIES.map((min) => (
            <button key={min} className={`btn btn-sm ${sleeptimerMin === min ? 'btn-p' : 'btn-g'}`} onClick={() => zetSleeptimer(min)}>
              {min} min
            </button>
          ))}
        </div>
        {sleeptimerResterend != null && (
          <p className="ss-sleeptimer-lbl">Stopt over {tijdLabel(sleeptimerResterend)}</p>
        )}
      </div>

      {toonUitleg && <OnderbouwingModal sleutel="mindfulnessSessies" onClose={() => setToonUitleg(false)} />}
    </div>
  );
}
