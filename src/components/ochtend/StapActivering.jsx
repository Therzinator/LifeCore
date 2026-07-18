import { useEffect, useState } from 'react';
import { REK_OEFENINGEN, energieHint } from '../../lib/ochtend/activering.js';
import { SPANNING_OEFENINGEN, spanningOefeningKernSet } from '../../lib/oefeningen/vrijeOefeningenDb.js';
import { useRustTimer } from '../../hooks/useRustTimer.js';
import OnderbouwingModal from '../ui/OnderbouwingModal.jsx';
import TimerRing from '../ui/TimerRing.jsx';
import OefeningPopup from '../ui/OefeningPopup.jsx';
import OefeningenBibliotheek from '../ui/OefeningenBibliotheek.jsx';
import './StapActivering.css';

export default function StapActivering({ dagdata, volgende, vorige, overslaan, geluidFragment }) {
  const [rekGedaan, setRekGedaan] = useState(() => new Set());
  const [plankDoel, setPlankDoel] = useState(30);
  const [plankGedaan, setPlankGedaan] = useState(false);
  const [pushAantal, setPushAantal] = useState(10);
  const [pushGedaan, setPushGedaan] = useState(false);
  const [toonUitleg, setToonUitleg] = useState(false);
  const plankTimer = useRustTimer(geluidFragment);

  useEffect(() => {
    if (plankTimer.totaal > 0 && !plankTimer.actief && plankTimer.resterend === 0) {
      setPlankGedaan(true);
    }
  }, [plankTimer.actief, plankTimer.resterend, plankTimer.totaal]);

  const hint = energieHint(dagdata.dag.checkin?.energie);

  function vinkRek(id) {
    setRekGedaan((huidig) => {
      const nieuw = new Set(huidig);
      if (nieuw.has(id)) nieuw.delete(id); else nieuw.add(id);
      return nieuw;
    });
  }

  return (
    <div>
      <div className="of-stap-titel">Ochtend activering</div>
      <p className="of-stap-tekst">
        Rek en strek, spanning verlichten (nek/schouders/borst), dan plank &amp; push-ups. Sla over wat niet past.
      </p>
      <div className="sa-kop-acties">
        <button className="ad-link" onClick={() => setToonUitleg(true)}>Waarom werkt dit?</button>
        <OefeningenBibliotheek oefeningen={SPANNING_OEFENINGEN} titel="Spanning verlichten — bibliotheek" />
      </div>

      {hint && <div className="sa-hint">{hint}</div>}

      <div className="card">
        <div className="sa-kop">
          <span>Rek & strek</span>
          <span className="sa-kop-hint">vink af wat je doet</span>
        </div>
        <div className="sa-lijst">
          {REK_OEFENINGEN.map((oef) => {
            const gedaan = rekGedaan.has(oef.id);
            return (
              <button key={oef.id} className={`sa-item ${gedaan ? 'gedaan' : ''}`} onClick={() => vinkRek(oef.id)}>
                <span className="sa-check">{gedaan ? '✓' : ''}</span>
                <span className="sa-item-tekst">
                  <span className="sa-item-naam">{oef.naam}</span>
                  <span className="sa-item-uitleg">{oef.uitleg}</span>
                  <span className="sa-item-duur">{oef.duur}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div className="sa-kop">
          <span>Spanning verlichten</span>
          <span className="sa-kop-hint">nek, schouders, borst</span>
        </div>
        {spanningOefeningKernSet().map((oef) => (
          <OefeningPopup key={oef.id} oefening={oef} />
        ))}
      </div>

      <div className="card">
        <div className="sa-kop"><span>🧱 Plank</span></div>
        <p className="of-stap-tekst">Onderarmen op de grond, lichaam in één rechte lijn.</p>

        {!plankTimer.actief ? (
          <div className="sa-teller-rij">
            <div className="sa-teller">
              <button className="sa-teller-btn" onClick={() => setPlankDoel((s) => Math.max(5, s - 5))}>−5s</button>
              <div className="sa-teller-mid">
                <div className="sa-teller-val">{plankDoel}</div>
                <div className="sa-teller-lbl">sec doel</div>
              </div>
              <button className="sa-teller-btn" onClick={() => setPlankDoel((s) => Math.min(300, s + 5))}>+5s</button>
            </div>
            <button className="btn btn-g btn-sm" onClick={() => plankTimer.start(plankDoel)}>▶ Start timer</button>
          </div>
        ) : (
          <div className="sa-ring-wrap">
            <TimerRing schaal={0.7 + 0.3 * (plankTimer.resterend / plankTimer.totaal)} label="Plank" waarde={plankTimer.resterend} />
            <button className="btn btn-g btn-sm" onClick={plankTimer.stop}>Stop</button>
          </div>
        )}

        <button className={`sa-gedaan-btn ${plankGedaan ? 'gedaan' : ''}`} onClick={() => setPlankGedaan((g) => !g)}>
          {plankGedaan ? '✓ Gedaan' : 'Markeer als gedaan'}
        </button>
      </div>

      <div className="card">
        <div className="sa-kop"><span>💪 Push-ups</span></div>
        <p className="of-stap-tekst">Handen schouderbreedte, lichaam recht. Op knieën is prima.</p>
        <div className="sa-teller-rij">
          <div className="sa-teller">
            <button className="sa-teller-btn" onClick={() => setPushAantal((n) => Math.max(1, n - 1))}>−</button>
            <div className="sa-teller-mid">
              <div className="sa-teller-val">{pushAantal}</div>
              <div className="sa-teller-lbl">reps</div>
            </div>
            <button className="sa-teller-btn" onClick={() => setPushAantal((n) => Math.min(100, n + 1))}>+</button>
          </div>
          <button className={`sa-gedaan-btn ${pushGedaan ? 'gedaan' : ''}`} onClick={() => setPushGedaan((g) => !g)}>
            {pushGedaan ? '✓ Gedaan' : 'Markeer als gedaan'}
          </button>
        </div>
      </div>

      <div className="of-acties">
        <button className="btn btn-text" onClick={vorige}>Terug</button>
        <button className="btn btn-text" onClick={overslaan}>Overslaan</button>
        <button className="btn btn-p btn-full" onClick={volgende}>Verder</button>
      </div>

      {toonUitleg && <OnderbouwingModal sleutel="ochtendActivering" onClose={() => setToonUitleg(false)} />}
    </div>
  );
}
