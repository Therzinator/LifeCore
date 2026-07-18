import { useState } from 'react';
import { ROEI_PROGRAMMAS, totaleDuur } from '../../lib/cardio/roeiProgrammas.js';
import './CardioRoeien.css';

const NIVEAUS = [
  { id: 'basis', label: 'Basis' },
  { id: 'duur', label: 'Duurtraining' },
  { id: 'interval', label: 'Interval' },
];

export default function CardioRoeien({ cardio, toonToast }) {
  const [niveau, setNiveau] = useState('basis');
  const programma = ROEI_PROGRAMMAS[niveau];

  function registreren() {
    const duur = totaleDuur(niveau);
    cardio.voegToe({
      datum: new Date().toISOString().slice(0, 10),
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
          <button key={n.id} className={`cro-niveau ${niveau === n.id ? 'on' : ''}`} onClick={() => setNiveau(n.id)}>
            {n.label}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="cro-titel">{programma.titel}</div>
        <p className="cro-omschrijving">{programma.omschrijving}</p>

        <div className="cro-stappen">
          {programma.stappen.map((stap, i) => (
            <div className="cro-stap" key={i}>
              <div className="cro-nr">{i + 1}</div>
              <div className="cro-inhoud">
                <div className="cro-fase-rij">
                  <span className="cro-fase">{stap.fase}</span>
                  <span className="cro-duur">{stap.duur} min</span>
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
