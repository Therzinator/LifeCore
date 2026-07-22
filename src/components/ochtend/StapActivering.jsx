import { useEffect, useState } from 'react';
import {
  REK_OEFENINGEN, energieHint, KINDHOUDING_ID, KINDHOUDING_TIMER_SECONDEN,
  KIN_NAAR_BORST_ID, KIN_NAAR_BORST_TIMER_SECONDEN, KIN_NAAR_BORST_TUSSENSIGNAAL_SECONDEN,
} from '../../lib/ochtend/activering.js';
import { useRustTimer } from '../../hooks/useRustTimer.js';
import { datumKey } from '../../utils/datum.js';
import OnderbouwingModal from '../ui/OnderbouwingModal.jsx';
import TimerRing from '../ui/TimerRing.jsx';
import './StapActivering.css';

export default function StapActivering({
  dagdata, volgende, vorige, overslaan, geluidFragment, kinNaarBorstTussenGeluid, kinNaarBorstEindGeluid,
  trainingsherinnering, geschiedenis, progressie,
}) {
  const vandaag = datumKey();
  const vandaagSessie = geschiedenis.sessies.find((s) => s.datum === vandaag);
  const [rekGedaan, setRekGedaan] = useState(() => new Set());
  const [plankGedaan, setPlankGedaanState] = useState(() => vandaagSessie?.plankGedaan ?? false);
  const [pushGedaan, setPushGedaanState] = useState(() => vandaagSessie?.pushGedaan ?? false);
  const [toonUitleg, setToonUitleg] = useState(false);
  const { plankDoel, pushAantal, zetPlankDoel, zetPushAantal } = progressie;
  const plankTimer = useRustTimer(geluidFragment);
  const kindhoudingTimer = useRustTimer(geluidFragment);
  const kinNaarBorstTimer = useRustTimer(kinNaarBorstEindGeluid);

  // Registreert meteen in activering_geschiedenis (i.p.v. alleen lokale
  // state) — dat voedt de wekelijkse opbouw/deload-berekening in
  // useActiveringProgressie.js, die per kalenderdag maar één keer draait.
  function zetPlankGedaan(waarde) {
    setPlankGedaanState(waarde);
    geschiedenis.registreer(vandaag, { plankSeconden: plankDoel, plankGedaan: waarde });
  }

  function zetPushGedaan(waarde) {
    setPushGedaanState(waarde);
    geschiedenis.registreer(vandaag, { pushReps: pushAantal, pushGedaan: waarde });
  }

  useEffect(() => {
    if (plankTimer.totaal > 0 && !plankTimer.actief && plankTimer.resterend === 0) {
      zetPlankGedaan(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- alleen reageren op het aflopen van de timer zelf.
  }, [plankTimer.actief, plankTimer.resterend, plankTimer.totaal]);

  useEffect(() => {
    if (kindhoudingTimer.totaal > 0 && !kindhoudingTimer.actief && kindhoudingTimer.resterend === 0) {
      setRekGedaan((huidig) => (huidig.has(KINDHOUDING_ID) ? huidig : new Set(huidig).add(KINDHOUDING_ID)));
    }
  }, [kindhoudingTimer.actief, kindhoudingTimer.resterend, kindhoudingTimer.totaal]);

  useEffect(() => {
    if (kinNaarBorstTimer.totaal > 0 && !kinNaarBorstTimer.actief && kinNaarBorstTimer.resterend === 0) {
      setRekGedaan((huidig) => (huidig.has(KIN_NAAR_BORST_ID) ? huidig : new Set(huidig).add(KIN_NAAR_BORST_ID)));
    }
  }, [kinNaarBorstTimer.actief, kinNaarBorstTimer.resterend, kinNaarBorstTimer.totaal]);

  // Kindhouding en 'Kin naar borst' delen dezelfde 'eigen timer i.p.v.
  // alleen een vinkje'-opzet (zie activering.js) — één opzoektabel i.p.v. de
  // JSX hieronder tweemaal uit te schrijven. Los daarvan blijft elke
  // timer-oefening ook gewoon handmatig af te vinken (vinkRek hieronder) —
  // de timer is een hulpmiddel, geen voorwaarde om 'm als gedaan te mogen
  // markeren.
  const TIMER_OEFENINGEN = {
    [KINDHOUDING_ID]: { timer: kindhoudingTimer, seconden: KINDHOUDING_TIMER_SECONDEN },
    [KIN_NAAR_BORST_ID]: {
      timer: kinNaarBorstTimer,
      seconden: KIN_NAAR_BORST_TIMER_SECONDEN,
      tussensignaal: {
        bijResterend: KIN_NAAR_BORST_TIMER_SECONDEN - KIN_NAAR_BORST_TUSSENSIGNAAL_SECONDEN,
        geluidFragment: kinNaarBorstTussenGeluid,
      },
    },
  };

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
        Rek en strek (incl. nek/schouders/borst), dan plank &amp; push-ups. Sla over wat niet past.
      </p>
      <div className="sa-kop-acties">
        <button className="ad-link" onClick={() => setToonUitleg(true)}>Waarom werkt dit?</button>
      </div>

      {hint && <div className="sa-hint">{hint}</div>}
      {trainingsherinnering && <div className="sa-hint">{trainingsherinnering}</div>}

      <div className="card">
        <div className="sa-kop">
          <span>Rek & strek</span>
          <span className="sa-kop-hint">vink af wat je doet</span>
        </div>
        <div className="sa-lijst">
          {REK_OEFENINGEN.map((oef) => {
            const gedaan = rekGedaan.has(oef.id);
            const timerOef = TIMER_OEFENINGEN[oef.id];
            if (timerOef) {
              return (
                <div key={oef.id} className={`sa-item ${gedaan ? 'gedaan' : ''}`}>
                  <button type="button" className="sa-item-toggle" onClick={() => vinkRek(oef.id)}>
                    <span className="sa-check">{gedaan ? '✓' : ''}</span>
                    <span className="sa-item-tekst">
                      <span className="sa-item-naam">{oef.naam}</span>
                      <span className="sa-item-uitleg">{oef.uitleg}</span>
                      <span className="sa-item-duur">{oef.duur}</span>
                    </span>
                  </button>
                  {timerOef.timer.actief ? (
                    <span className="sa-item-timer-actief">{timerOef.timer.resterend}s</span>
                  ) : (
                    <button
                      type="button"
                      className="sa-item-timer-btn"
                      onClick={() => timerOef.timer.start(timerOef.seconden, timerOef.tussensignaal)}
                    >
                      ▶ Start
                    </button>
                  )}
                </div>
              );
            }
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
        <div className="sa-kop"><span>🧱 Plank</span></div>
        <p className="of-stap-tekst">Onderarmen op de grond, lichaam in één rechte lijn.</p>

        {!plankTimer.actief ? (
          <div className="sa-teller-rij">
            <div className="sa-teller">
              <button className="sa-teller-btn" onClick={() => zetPlankDoel(Math.max(5, plankDoel - 5))}>−5s</button>
              <div className="sa-teller-mid">
                <div className="sa-teller-val">{plankDoel}</div>
                <div className="sa-teller-lbl">sec doel</div>
              </div>
              <button className="sa-teller-btn" onClick={() => zetPlankDoel(Math.min(300, plankDoel + 5))}>+5s</button>
            </div>
            {/* Zelfde 'tijd om in positie te komen'-opzet als kindhouding/nekstrek (zie activering.js) — timer loopt 5s langer dan het ingestelde doel. */}
            <button className="btn btn-g btn-sm" onClick={() => plankTimer.start(plankDoel + 5)}>▶ Start timer</button>
            <p className="ti-hint">Timer loopt 5s extra om in positie te komen. Doel bouwt vanzelf wekelijks op.</p>
          </div>
        ) : (
          <div className="sa-ring-wrap">
            <TimerRing schaal={0.7 + 0.3 * (plankTimer.resterend / plankTimer.totaal)} label="Plank" waarde={plankTimer.resterend} />
            <button className="btn btn-g btn-sm" onClick={plankTimer.stop}>Stop</button>
          </div>
        )}

        <button className={`sa-gedaan-btn ${plankGedaan ? 'gedaan' : ''}`} onClick={() => zetPlankGedaan(!plankGedaan)}>
          {plankGedaan ? '✓ Gedaan' : 'Markeer als gedaan'}
        </button>
      </div>

      <div className="card">
        <div className="sa-kop"><span>💪 Push-ups</span></div>
        <p className="of-stap-tekst">Handen schouderbreedte, lichaam recht. Op knieën is prima.</p>
        <div className="sa-teller-rij">
          <div className="sa-teller">
            <button className="sa-teller-btn" onClick={() => zetPushAantal(Math.max(1, pushAantal - 1))}>−</button>
            <div className="sa-teller-mid">
              <div className="sa-teller-val">{pushAantal}</div>
              <div className="sa-teller-lbl">reps</div>
            </div>
            <button className="sa-teller-btn" onClick={() => zetPushAantal(Math.min(100, pushAantal + 1))}>+</button>
          </div>
          <button className={`sa-gedaan-btn ${pushGedaan ? 'gedaan' : ''}`} onClick={() => zetPushGedaan(!pushGedaan)}>
            {pushGedaan ? '✓ Gedaan' : 'Markeer als gedaan'}
          </button>
        </div>
        <p className="ti-hint">Doel bouwt vanzelf wekelijks op.</p>
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
