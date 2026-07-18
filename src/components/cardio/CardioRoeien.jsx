import { useState } from 'react';
import { ROEI_PROGRAMMAS, totaleDuur, bouwHiitProgramma } from '../../lib/cardio/roeiProgrammas.js';
import { useIntervalTimer } from '../../hooks/useIntervalTimer.js';
import { datumKey } from '../../utils/datum.js';
import './CardioRoeien.css';

const NIVEAUS = [
  { id: 'basis', label: 'Basis' },
  { id: 'duur', label: 'Duurtraining' },
  { id: 'interval', label: 'Interval' },
  { id: 'hiit', label: 'HIIT' },
];

function duurLabel(minuten) {
  if (minuten < 1) return `${Math.round(minuten * 60)} sec`;
  return `${minuten} min`;
}

function tijdLabel(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function CardioRoeien({ cardio, toonToast, instellingen }) {
  const [niveau, setNiveau] = useState('basis');
  const programma = niveau === 'hiit'
    ? bouwHiitProgramma(instellingen.hiitWerkSec, instellingen.hiitRustSec, instellingen.hiitRondes)
    : ROEI_PROGRAMMAS[niveau];
  const timer = useIntervalTimer(programma.stappen, instellingen.geluidFragment, niveau);

  function registreren() {
    const duur = totaleDuur(programma);
    cardio.voegToe({
      datum: datumKey(),
      type: 'roeien',
      omgeving: null,
      duur,
      afstand: 0,
      tempo: '',
      hartslag: 0,
      rpe: 0,
      niveau,
      notities: `Roeiprogramma: ${programma.titel}`,
      pr: false,
    });
    toonToast(`Roeisessie (${duur} min) opgeslagen ✓`, 'ok');
  }

  return (
    <div>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Roeimachine</div>
      <p className="of-stap-tekst">
        Roeien geeft vergelijkbare cardiobelasting als hardlopen, zonder impact op knieën en enkels.
        Handig op rustdagen of als het weer buiten sporten lastig maakt.
      </p>

      <div className="cro-niveaus">
        {NIVEAUS.map((n) => (
          <button
            key={n.id}
            className={`cro-niveau ${niveau === n.id ? 'on' : ''}`}
            onClick={() => setNiveau(n.id)}
          >
            {n.label}
          </button>
        ))}
      </div>

      <div className="card cro-timer">
        <div className="td-label">Intervaltimer</div>
        {timer.voltooid ? (
          <p className="of-stap-tekst">Sessie voltooid — goed gedaan! Vergeet niet te registreren hieronder.</p>
        ) : (
          <>
            <div className="cro-timer-fase">{timer.stap?.fase ?? '—'}</div>
            <div className="cro-timer-tijd">{tijdLabel(timer.resterend)}</div>
            <div className="cro-timer-lbl">Fase {timer.stapIndex + 1} van {timer.totaalStappen}</div>
          </>
        )}
        <div className="ti-rij" style={{ marginTop: 'var(--space-sm)' }}>
          <button className="btn btn-g btn-sm" disabled={timer.isEersteFase} onClick={timer.vorigeFase} aria-label="Vorige fase">⏮</button>
          {!timer.actief && (
            <button className="btn btn-p btn-sm" style={{ flex: 1 }} onClick={timer.start}>▶ Start</button>
          )}
          {timer.actief && (
            <button className="btn btn-g btn-sm" style={{ flex: 1 }} onClick={timer.pauzeer}>Pauzeer</button>
          )}
          <button className="btn btn-g btn-sm" disabled={timer.isLaatsteFase} onClick={timer.volgendeFase} aria-label="Volgende fase">⏭</button>
        </div>
        <button className="btn btn-text btn-sm" style={{ marginTop: 'var(--space-xs)' }} onClick={timer.stop}>Reset</button>
      </div>

      <div className="card">
        <div className="cro-titel">{programma.titel}</div>
        <p className="cro-omschrijving">{programma.omschrijving}</p>

        <div className="cro-stappen">
          {programma.stappen.map((stap, i) => (
            <div className={`cro-stap ${timer.actief && i === timer.stapIndex ? 'actief' : ''}`} key={i}>
              <div className="cro-nr">{i + 1}</div>
              <div className="cro-inhoud">
                <div className="cro-fase-rij">
                  <span className="cro-fase">{stap.fase}</span>
                  <span className="cro-duur">{duurLabel(stap.duur)}</span>
                </div>
                <div className="cro-uitleg">{stap.uitleg}</div>
              </div>
            </div>
          ))}
        </div>

        <button className="btn btn-p btn-full" onClick={registreren} style={{ marginTop: 'var(--space-md)' }}>
          Roeisessie registreren ✓
        </button>
      </div>
    </div>
  );
}
