import { useState } from 'react';
import { berekenOpbouwsets } from '../../lib/training/opbouw.js';
import { volgendeGewicht, isNieuwePR } from '../../lib/training/progressie.js';
import { MOBILITEIT_OEFENINGEN } from '../../lib/training/mobiliteit.js';
import { oefeningMetAfbeeldingPerId, extraOefeningMetAfbeelding } from '../../lib/oefeningen/vrijeOefeningenDb.js';
import SchijvenWeergave from './SchijvenWeergave.jsx';
import RustTimer from './RustTimer.jsx';
import OefeningPopup from '../ui/OefeningPopup.jsx';
import Modal from '../ui/Modal.jsx';
import OefeningDetail from '../ui/OefeningDetail.jsx';
import './TrainingSessie.css';

function metAangepastGewicht(lijst, i, si, delta) {
  return lijst.map((item, idx) => {
    if (idx !== i) return item;
    const setGew = [...item.setGew];
    setGew[si] = Math.max(1.25, Math.round((setGew[si] + delta) * 100) / 100);
    return { ...item, setGew };
  });
}

function metAlleGewichtAangepast(lijst, i, delta) {
  return lijst.map((item, idx) => {
    if (idx !== i) return item;
    return { ...item, setGew: item.setGew.map((g) => Math.max(1.25, Math.round((g + delta) * 100) / 100)) };
  });
}

function metGewichtOveralAangepast(lijst, delta) {
  return lijst.map((item) => ({
    ...item,
    setGew: item.setGew.map((g) => Math.max(1.25, Math.round((g + delta) * 100) / 100)),
  }));
}

function metAangepasteReps(lijst, i, si, delta) {
  return lijst.map((item, idx) => {
    if (idx !== i) return item;
    const setReps = [...item.setReps];
    setReps[si] = Math.max(1, setReps[si] + delta);
    return { ...item, setReps };
  });
}

function metSetAfgevinkt(lijst, i, si) {
  return lijst.map((item, idx) => {
    if (idx !== i) return item;
    const werk = [...item.werk];
    werk[si] = !werk[si];
    return { ...item, werk };
  });
}

function volgendeObWaarde(huidig, maxReps) {
  if (huidig === null || huidig === undefined) return maxReps;
  if (huidig > 1) return huidig - 1;
  return null;
}

function gemiddelde(lijst) {
  return lijst.reduce((a, b) => a + b, 0) / lijst.length;
}

export default function TrainingSessie({
  training, setOefeningen, setExtras, setWarmup,
  instellingen, geschiedenis, setGewicht, rustTimer, toonToast, onAfgerond,
}) {
  const { oefeningen, extras = [] } = training;
  const instStangen = { stangRecht: instellingen.stangRecht, stangCurl: instellingen.stangCurl };
  const [detailId, setDetailId] = useState(null);
  const detailOefening = detailId ? oefeningMetAfbeeldingPerId(detailId) : null;
  const [detailExtraId, setDetailExtraId] = useState(null);
  const detailExtraOefening = detailExtraId
    ? extraOefeningMetAfbeelding(extras.find((e) => e.id === detailExtraId))
    : null;
  const [toonMobiliteit, setToonMobiliteit] = useState(false);

  const hoofdKlaar = oefeningen.every((o) => o.werk.every(Boolean));
  const extraKlaar = !extras.length || extras.every((e) => e.werk.every(Boolean));
  const klaarOmAfTeRonden = hoofdKlaar && extraKlaar;

  let totaalSets = 2;
  let klaarSets = (training.wuRoei ? 1 : 0) + (training.wuMob ? 1 : 0);
  oefeningen.forEach((o) => { totaalSets += o.sets; klaarSets += o.werk.filter(Boolean).length; });
  extras.forEach((e) => { totaalSets += e.sets; klaarSets += e.werk.filter(Boolean).length; });
  const voortgangPct = totaalSets ? Math.round((klaarSets / totaalSets) * 100) : 0;

  function vinkWarmup(type) {
    setWarmup(type === 'roei' ? { wuRoei: !training.wuRoei } : { wuMob: !training.wuMob });
  }

  function vinkOpbouwSet(oi, si, maxReps) {
    const nieuw = oefeningen.map((o, idx) => {
      if (idx !== oi) return o;
      const ob = [...o.ob];
      ob[si] = volgendeObWaarde(ob[si], maxReps);
      return { ...o, ob };
    });
    setOefeningen(nieuw);
  }

  function vinkWerkSet(oi, si) {
    const nieuw = metSetAfgevinkt(oefeningen, oi, si);
    setOefeningen(nieuw);
    const oef = nieuw[oi];
    if (oef.werk[si]) {
      if (oef.werk.every(Boolean)) toonToast(`${oef.naam} — alle sets klaar`, 'ok');
      else rustTimer.start(oef.type === 'zw' ? instellingen.rustZwaar : instellingen.rustLicht);
    } else {
      rustTimer.stop();
    }
  }

  function vinkExtraSet(ei, si) {
    const nieuw = metSetAfgevinkt(extras, ei, si);
    setExtras(nieuw);
    const ext = nieuw[ei];
    if (ext.werk[si]) {
      if (ext.werk.every(Boolean)) toonToast(`${ext.naam} — alle sets klaar`, 'ok');
      else rustTimer.start(instellingen.rustLicht);
    } else {
      rustTimer.stop();
    }
  }

  function pasSetGewicht(oi, si, delta) {
    setOefeningen(metAangepastGewicht(oefeningen, oi, si, delta));
  }
  function pasAlleSetGewicht(oi, delta) {
    setOefeningen(metAlleGewichtAangepast(oefeningen, oi, delta));
  }
  function pasSetReps(oi, si, delta) {
    setOefeningen(metAangepasteReps(oefeningen, oi, si, delta));
  }
  function pasExtraSetGewicht(ei, si, delta) {
    setExtras(metAangepastGewicht(extras, ei, si, delta));
  }
  function pasAlleExtraSetGewicht(ei, delta) {
    setExtras(metAlleGewichtAangepast(extras, ei, delta));
  }
  function pasExtraSetReps(ei, si, delta) {
    setExtras(metAangepasteReps(extras, ei, si, delta));
  }
  function pasHeleTraining(delta) {
    setOefeningen(metGewichtOveralAangepast(oefeningen, delta));
    if (extras.length) setExtras(metGewichtOveralAangepast(extras, delta));
    toonToast(`${delta > 0 ? '+' : ''}${delta} kg op alle oefeningen`, 'neu');
  }

  function afronden() {
    rustTimer.stop();

    let volume = 0;
    oefeningen.forEach((o) => {
      o.setGew.forEach((gew, si) => { if (o.werk[si]) volume += gew * o.reps; });
    });

    const record = {
      datum: new Date().toISOString(),
      letter: training.letter,
      volume,
      oefeningen: oefeningen.map((o) => {
        const setsGedaan = o.werk.filter(Boolean).length;
        const gemGew = Math.round(gemiddelde(o.setGew) * 10) / 10;
        return { id: o.id, naam: o.naam, gewicht: gemGew, setsGedaan, setsTotaal: o.sets, reps: o.reps };
      }),
      extraOefeningen: extras.map((e) => {
        const setsGedaan = e.werk.filter(Boolean).length;
        if (!setsGedaan) return null;
        const gemGew = Math.round(gemiddelde(e.setGew) * 10) / 10;
        return { id: e.id, naam: e.naam, gewicht: gemGew, sets: setsGedaan, reps: e.reps };
      }).filter(Boolean),
    };
    geschiedenis.voegToe(record);

    if (instellingen.programma === 'sl5x5') {
      oefeningen.forEach((o) => {
        if (o.werk.every(Boolean)) {
          const gemGew = gemiddelde(o.setGew);
          setGewicht(o.id, volgendeGewicht(Math.round(gemGew * 10) / 10, o.increment));
        }
      });
    } else {
      toonToast("Madcow bevat nog geen automatische progressie — pas gewichten handmatig aan bij Mijn profiel", 'neu');
    }

    toonToast('Training opgeslagen', 'ok');
    onAfgerond();
  }

  return (
    <div>
      <div className="ts-kop">
        <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Training {training.letter}</div>
        <button className="btn btn-p btn-sm" onClick={afronden} disabled={!klaarOmAfTeRonden}>Afronden ✓</button>
      </div>

      <div className="ts-voortgang-track"><div className="ts-voortgang-fill" style={{ width: `${voortgangPct}%` }} /></div>
      <div className="ts-voortgang-lbl">{klaarSets}/{totaalSets}</div>

      <div className="ts-warmup">
        <div className="ts-warmup-titel">Warming-up — roeimachine &amp; mobiliteit</div>
        <button className={`ts-warmup-stap ${training.wuRoei ? 'gedaan' : ''}`} onClick={() => vinkWarmup('roei')}>
          <span className="ts-warmup-check">{training.wuRoei ? '✓' : '○'}</span>
          <span>
            <div>Roeimachine — 5 min</div>
            <div className="ts-warmup-detail">~900m · weerstand 3–4 · SPM 20–22</div>
          </span>
        </button>
        <button className={`ts-warmup-stap ${training.wuMob ? 'gedaan' : ''}`} onClick={() => vinkWarmup('mob')}>
          <span className="ts-warmup-check">{training.wuMob ? '✓' : '○'}</span>
          <span>
            <div>Dynamische mobiliteit — 5 min</div>
            <div className="ts-warmup-detail">Heupen · schouders · wervelkolom · enkels</div>
          </span>
        </button>
        <button type="button" className="bd-inklap-knop" onClick={() => setToonMobiliteit((v) => !v)}>
          <span className="ts-warmup-detail" style={{ marginLeft: 34 }}>Oefeningen &amp; uitleg</span>
          <span aria-hidden="true">{toonMobiliteit ? '▲' : '▼'}</span>
        </button>
        {toonMobiliteit && (
          <div className="ts-mobiliteit-lijst">
            {MOBILITEIT_OEFENINGEN.map((oef) => (
              <OefeningPopup key={oef.id} oefening={oef} />
            ))}
          </div>
        )}
      </div>

      <div className="ts-hele-training">
        <div className="ts-hele-training-lbl">Hele training</div>
        <div className="ts-gewicht-kies">
          <button className="btn btn-g btn-sm" onClick={() => pasHeleTraining(-instellingen.gewichtStap)}>−{instellingen.gewichtStap}</button>
          <span className="ts-hele-training-stap">alle sets</span>
          <button className="btn btn-g btn-sm" onClick={() => pasHeleTraining(instellingen.gewichtStap)}>+{instellingen.gewichtStap}</button>
        </div>
      </div>

      {oefeningen.map((oef, oefIndex) => {
        const opbouw = berekenOpbouwsets(oef.gewicht, oef.stangType, instellingen.gewichtStap, instStangen, instellingen.opbouwStappen);
        const isPR = isNieuwePR(oef.id, oef.gewicht, geschiedenis.sessies);
        const maxGew = Math.max(...oef.setGew);

        return (
          <div className="ts-oefening" key={oef.id}>
            <div className="ts-oefening-kop">
              <button type="button" className="ts-oefening-naam ts-oefening-naam-btn" onClick={() => setDetailId(oef.id)}>
                {oef.naam}
                {isPR && <span className="ts-pr">PR</span>}
                <span className="ts-oefening-info">ⓘ</span>
              </button>
              <div className="ts-oefening-sub">
                <span className="ts-oefening-spier">{oef.spier}</span>
                <span>{oef.sets} × {oef.reps} werksets</span>
              </div>
              <SchijvenWeergave totaalGewicht={maxGew} stangType={oef.stangType} instStangen={instStangen} />
            </div>

            {opbouw.length > 0 && (
              <div className="ts-opbouw">
                <div className="ts-opbouw-lbl">Opbouwsets</div>
                {opbouw.map((set, si) => {
                  const waarde = oef.ob[si];
                  const gedaan = waarde != null;
                  return (
                    <button
                      key={si}
                      className={`ts-opbouw-set ${gedaan ? 'gedaan' : ''}`}
                      onClick={() => vinkOpbouwSet(oefIndex, si, set.reps)}
                    >
                      <span className="ts-opbouw-label">{set.label}</span>
                      <span>{set.gewicht} kg × {set.reps}</span>
                      <span className="ts-opbouw-check">{gedaan ? (waarde === set.reps ? '✓' : waarde) : '○'}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="ts-alle-sets">
              <span>Alle werksets</span>
              <button className="btn btn-g btn-sm" onClick={() => pasAlleSetGewicht(oefIndex, -instellingen.gewichtStap)}>−{instellingen.gewichtStap}</button>
              <button className="btn btn-g btn-sm" onClick={() => pasAlleSetGewicht(oefIndex, instellingen.gewichtStap)}>+{instellingen.gewichtStap}</button>
            </div>

            <div className="ts-sets-tbl">
              {oef.setGew.map((gew, si) => (
                <div className={`ts-set-rij ${oef.werk[si] ? 'gedaan' : ''}`} key={si}>
                  <span className="ts-set-nr">{si + 1}</span>
                  <div className="ts-set-ctrl">
                    <button className="ts-mini-btn" onClick={() => pasSetGewicht(oefIndex, si, -instellingen.gewichtStap)}>−</button>
                    <span className="ts-set-waarde">{gew} kg</span>
                    <button className="ts-mini-btn" onClick={() => pasSetGewicht(oefIndex, si, instellingen.gewichtStap)}>+</button>
                  </div>
                  <div className="ts-set-ctrl">
                    <button className="ts-mini-btn" onClick={() => pasSetReps(oefIndex, si, -1)}>−</button>
                    <span className="ts-set-waarde">{oef.setReps[si]} reps</span>
                    <button className="ts-mini-btn" onClick={() => pasSetReps(oefIndex, si, 1)}>+</button>
                  </div>
                  <button className={`ts-set-check ${oef.werk[si] ? 'gedaan' : ''}`} onClick={() => vinkWerkSet(oefIndex, si)}>
                    {oef.werk[si] ? '✓' : ''}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {extras.length > 0 && (
        <div className="ts-extra-sectie">
          <div className="ts-extra-titel">Extra oefeningen</div>
          {extras.map((ext, ei) => (
            <div className="ts-oefening ts-oefening-extra" key={ext.id}>
              <div className="ts-oefening-kop">
                <button type="button" className="ts-oefening-naam ts-oefening-naam-btn" onClick={() => setDetailExtraId(ext.id)}>
                  {ext.naam}
                  <span className="ts-oefening-info">ⓘ</span>
                </button>
                <div className="ts-oefening-sub">
                  <span className="ts-oefening-spier">{ext.spier}</span>
                  <span>{ext.sets} × {ext.reps} werksets</span>
                  <span className="ts-extra-equip">{ext.equip}</span>
                </div>
              </div>

              <div className="ts-alle-sets">
                <span>Alle werksets</span>
                <button className="btn btn-g btn-sm" onClick={() => pasAlleExtraSetGewicht(ei, -instellingen.gewichtStap)}>−{instellingen.gewichtStap}</button>
                <button className="btn btn-g btn-sm" onClick={() => pasAlleExtraSetGewicht(ei, instellingen.gewichtStap)}>+{instellingen.gewichtStap}</button>
              </div>

              <div className="ts-sets-tbl">
                {ext.setGew.map((gew, si) => (
                  <div className={`ts-set-rij ${ext.werk[si] ? 'gedaan' : ''}`} key={si}>
                    <span className="ts-set-nr">{si + 1}</span>
                    <div className="ts-set-ctrl">
                      <button className="ts-mini-btn" onClick={() => pasExtraSetGewicht(ei, si, -instellingen.gewichtStap)}>−</button>
                      <span className="ts-set-waarde">{gew} kg</span>
                      <button className="ts-mini-btn" onClick={() => pasExtraSetGewicht(ei, si, instellingen.gewichtStap)}>+</button>
                    </div>
                    <div className="ts-set-ctrl">
                      <button className="ts-mini-btn" onClick={() => pasExtraSetReps(ei, si, -1)}>−</button>
                      <span className="ts-set-waarde">{ext.setReps[si]} reps</span>
                      <button className="ts-mini-btn" onClick={() => pasExtraSetReps(ei, si, 1)}>+</button>
                    </div>
                    <button className={`ts-set-check ${ext.werk[si] ? 'gedaan' : ''}`} onClick={() => vinkExtraSet(ei, si)}>
                      {ext.werk[si] ? '✓' : ''}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="of-acties">
        <button className="btn btn-p btn-full" onClick={afronden} disabled={!klaarOmAfTeRonden}>Training afronden</button>
      </div>

      <RustTimer timer={rustTimer} />

      {detailOefening && (
        <Modal titel={detailOefening.naam} onClose={() => setDetailId(null)}>
          <OefeningDetail oefening={detailOefening} />
        </Modal>
      )}

      {detailExtraOefening && (
        <Modal titel={detailExtraOefening.naam} onClose={() => setDetailExtraId(null)}>
          <OefeningDetail oefening={detailExtraOefening} />
        </Modal>
      )}
    </div>
  );
}
