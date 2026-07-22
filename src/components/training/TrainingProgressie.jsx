import { useState } from 'react';
import { alleExtraOefeningen } from '../../lib/training/schema.js';
import { bereken1RM } from '../../lib/training/progressie.js';
import './TrainingProgressie.css';

function datumKort(iso) {
  return new Date(iso).toLocaleDateString('nl-NL', { day: 'numeric', month: 'numeric' });
}

function uniekeOefeningen(programma) {
  const gezien = new Set();
  return [...programma.A, ...programma.B].filter((o) => {
    if (gezien.has(o.id)) return false;
    gezien.add(o.id);
    return true;
  });
}

function activeringChart(sessies, veldGedaan, veldWaarde) {
  return sessies
    .filter((s) => s[veldGedaan] && (s[veldWaarde] ?? 0) > 0)
    .sort((a, b) => (a.datum > b.datum ? 1 : -1))
    .slice(-14)
    .map((s) => ({ datum: s.datum, waarde: s[veldWaarde] }));
}

export default function TrainingProgressie({
  profiel, programma, geschiedenis, extraOefeningen, activeringGeschiedenis, activeringDoelen,
}) {
  const oefeningen = uniekeOefeningen(programma);
  const [oefeningId, setOefeningId] = useState(() => oefeningen[0]?.id);
  const huidigeOef = oefeningen.find((o) => o.id === oefeningId) ?? oefeningen[0];

  const punten = geschiedenis.sessies.flatMap((t) =>
    (t.oefeningen || []).filter((o) => o.id === oefeningId).map((o) => ({ datum: t.datum, gewicht: o.gewicht })),
  );
  const huidig = profiel.gewichten[oefeningId] ?? 0;
  const max = punten.length ? punten.reduce((a, b) => (b.gewicht > a.gewicht ? b : a)) : null;
  const eerste = punten[0];
  const recent = punten.slice(-14);
  const maxSchaal = recent.length ? Math.max(...recent.map((p) => p.gewicht)) * 1.1 : 1;

  const plankPunten = activeringGeschiedenis ? activeringChart(activeringGeschiedenis.sessies, 'plankGedaan', 'plankSeconden') : [];
  const pushPunten = activeringGeschiedenis ? activeringChart(activeringGeschiedenis.sessies, 'pushGedaan', 'pushReps') : [];
  const plankMaxSchaal = plankPunten.length ? Math.max(...plankPunten.map((p) => p.waarde)) * 1.1 : 1;
  const pushMaxSchaal = pushPunten.length ? Math.max(...pushPunten.map((p) => p.waarde)) * 1.1 : 1;

  const alleExtra = alleExtraOefeningen();
  const actieveExtraMetData = alleExtra.filter(
    (e) => extraOefeningen.actief.includes(e.id)
      && geschiedenis.sessies.some((t) => (t.extraOefeningen || []).some((x) => x.id === e.id)),
  );
  const actieveExtraZonderData = alleExtra.filter(
    (e) => extraOefeningen.actief.includes(e.id) && !actieveExtraMetData.includes(e),
  );

  return (
    <div>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Progressie</div>
      <p className="of-stap-tekst">Gewichtsontwikkeling per oefening.</p>

      <div className="te-tabs">
        {oefeningen.map((o) => (
          <button key={o.id} className={`te-tab ${oefeningId === o.id ? 'on' : ''}`} onClick={() => setOefeningId(o.id)}>
            {o.naam}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="td-label">{huidigeOef?.naam} — progressie</div>
        <div className="tp-huidig-rij">
          <span className="tp-huidig">{huidig}</span>
          <span className="tp-huidig-lbl">kg huidig</span>
          {max && huidig === max.gewicht && <span className="ts-pr">PR</span>}
        </div>
        {punten.length === 0 ? (
          <p className="of-stap-tekst">Nog geen data — doe een training.</p>
        ) : (
          <>
            <div className="tp-stijg">{huidig - eerste.gewicht >= 0 ? '+' : ''}{huidig - eerste.gewicht} kg totaal · {punten.length} sessies</div>
            <div className="tp-chart">
              {recent.map((p, i) => (
                <div
                  key={i}
                  className={`tp-bar ${max && p.gewicht === max.gewicht ? 'pr' : ''}`}
                  style={{ height: `${Math.round((p.gewicht / maxSchaal) * 100)}%` }}
                  title={`${p.gewicht} kg`}
                />
              ))}
            </div>
            <div className="tp-chart-labels">
              {recent.map((p, i) => <div key={i} className="tp-chart-lbl">{datumKort(p.datum)}</div>)}
            </div>
          </>
        )}
      </div>

      <div className="card">
        <div className="td-label">1RM schatting — Epley (gewicht × 5 reps)</div>
        <div className="td-grid">
          {oefeningen.map((o) => (
            <div className="metric" key={o.id}>
              <div className="ml">{o.naam} 1RM</div>
              <div className="mv">{bereken1RM(profiel.gewichten[o.id] ?? 0, 5)} <span className="mu">kg</span></div>
              <div className="ms">{profiel.gewichten[o.id] ?? 0} kg × 5</div>
            </div>
          ))}
        </div>
        <p className="tp-epley-hint">Alleen als richtlijn — geen vervanging voor een echte 1RM-test.</p>
      </div>

      {activeringDoelen && (
        <div className="card">
          <div className="td-label">Ochtend-activering — plank &amp; push-ups</div>
          <div className="tp-huidig-rij">
            <span className="tp-huidig" style={{ fontSize: 'var(--font-size-lg)' }}>{activeringDoelen.plankDoel}s</span>
            <span className="tp-huidig-lbl">plank-doel</span>
          </div>
          {plankPunten.length === 0 ? (
            <p className="of-stap-tekst">Nog geen data — doe de Ochtend-activering.</p>
          ) : (
            <>
              <div className="tp-chart">
                {plankPunten.map((p, i) => (
                  <div key={i} className="tp-bar" style={{ height: `${Math.round((p.waarde / plankMaxSchaal) * 100)}%` }} title={`${p.waarde}s`} />
                ))}
              </div>
              <div className="tp-chart-labels">
                {plankPunten.map((p, i) => <div key={i} className="tp-chart-lbl">{datumKort(p.datum)}</div>)}
              </div>
            </>
          )}

          <div className="tp-huidig-rij" style={{ marginTop: 'var(--space-md)' }}>
            <span className="tp-huidig" style={{ fontSize: 'var(--font-size-lg)' }}>{activeringDoelen.pushAantal}</span>
            <span className="tp-huidig-lbl">push-up-doel (reps)</span>
          </div>
          {pushPunten.length === 0 ? (
            <p className="of-stap-tekst">Nog geen data — doe de Ochtend-activering.</p>
          ) : (
            <>
              <div className="tp-chart">
                {pushPunten.map((p, i) => (
                  <div key={i} className="tp-bar" style={{ height: `${Math.round((p.waarde / pushMaxSchaal) * 100)}%` }} title={`${p.waarde} reps`} />
                ))}
              </div>
              <div className="tp-chart-labels">
                {pushPunten.map((p, i) => <div key={i} className="tp-chart-lbl">{datumKort(p.datum)}</div>)}
              </div>
            </>
          )}
          <p className="tp-epley-hint">Bouwt vanzelf op na 3+ geslaagde dagen in de afgelopen week, bouwt af na 10+ dagen pauze.</p>
        </div>
      )}

      <div className="td-label" style={{ marginTop: 'var(--space-md)' }}>Extra oefeningen</div>
      {actieveExtraMetData.length === 0 && actieveExtraZonderData.length === 0 && (
        <p className="of-stap-tekst">Activeer extra oefeningen om progressie bij te houden.</p>
      )}
      {actieveExtraMetData.map((e) => {
        const pts = geschiedenis.sessies.flatMap((t) =>
          (t.extraOefeningen || []).filter((x) => x.id === e.id).map((x) => ({ datum: t.datum, gewicht: x.gewicht })),
        );
        const maxE = pts.reduce((a, b) => (b.gewicht > a.gewicht ? b : a));
        const huidigE = pts[pts.length - 1].gewicht;
        const stijgE = huidigE - pts[0].gewicht;
        return (
          <div className="card" key={e.id}>
            <div className="td-label">{e.naam}</div>
            <div className="tp-huidig-rij">
              <span className="tp-huidig" style={{ fontSize: 'var(--font-size-lg)' }}>{huidigE}</span>
              <span className="tp-huidig-lbl">kg huidig</span>
              {huidigE === maxE.gewicht && <span className="ts-pr">PR</span>}
            </div>
            <div className="tp-stijg">{stijgE >= 0 ? '+' : ''}{stijgE} kg · {pts.length} sessies</div>
          </div>
        );
      })}
      {actieveExtraZonderData.map((e) => (
        <div className="card" key={e.id} style={{ opacity: .7 }}>
          <div className="td-label">{e.naam}</div>
          <p className="of-stap-tekst">Nog geen data — doe een training.</p>
        </div>
      ))}
    </div>
  );
}
