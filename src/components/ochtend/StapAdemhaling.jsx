import { useEffect, useRef, useState } from 'react';
import { faseOpTijdstip } from '../../lib/ochtend/ademhaling.js';
import { speelFragment } from '../../lib/geluid/fragmenten.js';
import { OCHTEND_ADEMHALING_AUDIO_PAD, GELEIDE_ADEMHALING_AUDIO_PAD } from '../../lib/geluid/meditatieAudio.js';
import { useSpraakVoorlezer } from '../../hooks/useSpraakVoorlezer.js';
import { useMeditatieAudioSpeler } from '../../hooks/useMeditatieAudioSpeler.js';
import OnderbouwingModal from '../ui/OnderbouwingModal.jsx';
import TimerRing from '../ui/TimerRing.jsx';
import HandsFreeKnop from '../ui/HandsFreeKnop.jsx';
import './StapAdemhaling.css';

const FASE_LABEL = { inademen: 'Adem in', vasthouden: 'Vasthouden', uitademen: 'Adem uit' };
// Programma-optie: vaste duur voor ogen-dicht gebruik, i.p.v. zelf bijhouden
// wanneer je stopt. 'Vrij' (null) blijft het bestaande open-einde-gedrag.
const DUUR_OPTIES = [2, 3, 5];
const GELUID_OPTIES = [
  { id: 'geen', label: '🔇 Geen' },
  { id: 'instrumenteel', label: '🎵 Instrumenteel' },
  { id: 'geleid', label: '🗣 Geleide ademhaling' },
];
const GELUID_PAD = { instrumenteel: OCHTEND_ADEMHALING_AUDIO_PAD, geleid: GELEIDE_ADEMHALING_AUDIO_PAD };

function schaalVoorFase(fase) {
  const voortgang = fase.secondenInFase / fase.duurFase;
  if (fase.naam === 'inademen') return 0.6 + 0.4 * voortgang;
  if (fase.naam === 'uitademen') return 1 - 0.4 * voortgang;
  return 1;
}

export default function StapAdemhaling({ dagdata, volgende, vorige, overslaan, geluidFragment }) {
  const [duurMinuten, setDuurMinuten] = useState(null);
  const [gestart, setGestart] = useState(false);
  const [gepauzeerd, setGepauzeerd] = useState(false);
  const [sessieId, setSessieId] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [toonUitleg, setToonUitleg] = useState(false);
  const [handsFree, setHandsFree] = useState(false);
  const [geluidKeuze, setGeluidKeuze] = useState('geen');
  const intervalRef = useRef(null);
  const geluidGespeeldRef = useRef(false);
  const meditatieAudioRef = useRef(null);
  const spraak = useSpraakVoorlezer();

  const totaleSeconden = duurMinuten != null ? duurMinuten * 60 : null;
  const programmaKlaar = totaleSeconden != null && elapsed >= totaleSeconden;
  const resterendTotaal = totaleSeconden != null ? Math.max(totaleSeconden - elapsed, 0) : null;
  const voortgangPct = totaleSeconden != null ? (elapsed / totaleSeconden) * 100 : null;

  useEffect(() => {
    if (!gestart || gepauzeerd || programmaKlaar) return undefined;
    intervalRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(intervalRef.current);
  }, [gestart, gepauzeerd, programmaKlaar]);

  useMeditatieAudioSpeler(meditatieAudioRef, {
    actief: gestart && !gepauzeerd && !programmaKlaar,
    audioAan: geluidKeuze !== 'geen',
    pad: GELUID_PAD[geluidKeuze],
    resterendSeconden: resterendTotaal,
    sessieId,
  });

  useEffect(() => {
    if (!programmaKlaar || geluidGespeeldRef.current) return;
    geluidGespeeldRef.current = true;
    speelFragment(geluidFragment);
    if (handsFree) spraak.spreek('Klaar.');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- alleen bij het bereiken van 'klaar' zelf, niet bij elke wijziging van handsFree/spraak.
  }, [programmaKlaar]);

  const fase = gestart && !programmaKlaar ? faseOpTijdstip(elapsed) : null;

  useEffect(() => {
    if (!handsFree || !fase) return;
    spraak.spreek(FASE_LABEL[fase.naam]);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- alleen bij een fase-overgang uitspreken, niet bij elke seconde-tick.
  }, [handsFree, fase?.naam]);

  function start() {
    geluidGespeeldRef.current = false;
    setElapsed(0);
    setSessieId((n) => n + 1);
    setGestart(true);
  }

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
        <>
          <div className="ad-duur-kies">
            <button className={`ad-duur-optie ${duurMinuten == null ? 'on' : ''}`} onClick={() => setDuurMinuten(null)}>
              Vrij
            </button>
            {DUUR_OPTIES.map((min) => (
              <button
                key={min}
                className={`ad-duur-optie ${duurMinuten === min ? 'on' : ''}`}
                onClick={() => setDuurMinuten(min)}
              >
                {min} min
              </button>
            ))}
          </div>
          <div className="ti-rij" style={{ marginBottom: 'var(--space-sm)' }}>
            {GELUID_OPTIES.map((o) => (
              <button
                key={o.id}
                type="button"
                className={`btn btn-sm ${geluidKeuze === o.id ? 'btn-p' : 'btn-g'}`}
                style={{ flex: 1 }}
                onClick={() => setGeluidKeuze(o.id)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}
      <audio ref={meditatieAudioRef} preload="none" />

      <div className="ad-ring-wrap">
        {gestart && (
          <div className="ad-cyclus">
            {gepauzeerd
              ? 'Gepauzeerd'
              : programmaKlaar
                ? 'Klaar'
                : duurMinuten != null
                  ? `Nog ${Math.ceil(resterendTotaal / 60)} min`
                  : `Cyclus ${fase.cyclusIndex + 1}`}
          </div>
        )}
        <TimerRing
          schaal={fase ? schaalVoorFase(fase) : gestart ? 1 : 0.6}
          label={!gestart ? 'Klaar?' : programmaKlaar ? 'Klaar' : gepauzeerd ? 'Pauze' : FASE_LABEL[fase.naam]}
          waarde={fase ? fase.resterend + 1 : null}
          voortgangPct={voortgangPct}
        />
      </div>

      <div className="of-acties">
        {!gestart && <button className="btn btn-text" onClick={vorige}>Terug</button>}
        {!gestart && <button className="btn btn-text" onClick={overslaan}>Overslaan</button>}
        {!gestart && <button className="btn btn-p btn-full" onClick={start}>Start</button>}
        {gestart && !programmaKlaar && (
          <button className="btn btn-g" onClick={() => setGepauzeerd((v) => !v)}>
            {gepauzeerd ? '▶ Hervatten' : '⏸ Pauzeren'}
          </button>
        )}
        {gestart && <button className="btn btn-p btn-full" onClick={klaar}>Klaar</button>}
      </div>

      {toonUitleg && <OnderbouwingModal sleutel="ademhaling446" onClose={() => setToonUitleg(false)} />}
    </div>
  );
}
