import GeluidKiezer from '../ui/GeluidKiezer.jsx';
import GetalVeld from '../ui/GetalVeld.jsx';
import './TrainingInstellingen.css';

export default function TrainingInstellingen({ instellingen, bewaar, onResetAlles, toonToast }) {
  function veld(key, parse = (v) => v) {
    return (e) => bewaar({ [key]: parse(e.target.value) });
  }

  function pasOpbouwStap(i, key) {
    return (waarde) => {
      const stappen = instellingen.opbouwStappen.map((stap, idx) => (idx === i ? { ...stap, [key]: waarde } : stap));
      bewaar({ opbouwStappen: stappen });
    };
  }

  function voegOpbouwStapToe() {
    const laatste = instellingen.opbouwStappen[instellingen.opbouwStappen.length - 1];
    // Nieuwe stap start net iets zwaarder dan de laatste bestaande — geen
    // zinloze duplicaat-percentage, en meteen een redelijk startpunt om
    // verder bij te schaven.
    const nieuwePct = Math.min(99, (laatste?.pct ?? 0) + 10);
    bewaar({ opbouwStappen: [...instellingen.opbouwStappen, { pct: nieuwePct, reps: 2 }] });
  }

  function verwijderOpbouwStap(i) {
    bewaar({ opbouwStappen: instellingen.opbouwStappen.filter((_, idx) => idx !== i) });
  }

  function reset() {
    if (!window.confirm('Alle trainingsdata wissen? Dit is onomkeerbaar.')) return;
    onResetAlles();
    toonToast('Trainingsdata gewist', 'neu');
  }

  return (
    <div>
      <p className="of-stap-tekst">Programma, rusttijden en voorkeuren.</p>

      <div className="card">
        <div className="td-label">Programma</div>
        <div className="ti-veld-grp">
          <label className="ti-lbl" htmlFor="ti-prog">Actief schema</label>
          <select id="ti-prog" className="ti-veld" value={instellingen.programma} onChange={veld('programma')}>
            <option value="sl5x5">StrongLifts 5×5 (beginner · +2,5 kg per sessie)</option>
            <option value="madcow">Madcow 5×5 (intermediate)</option>
          </select>
        </div>
        <p className="ti-hint">
          <strong>SL5×5</strong> — automatische progressie: +2,5 kg na elke geslaagde training (deadlift +5 kg).<br />
          <strong>Madcow 5×5</strong> — nog geen automatische progressie; pas gewichten handmatig aan bij Mijn profiel.
        </p>
        <div className="ti-veld-grp" style={{ marginTop: 'var(--space-sm)' }}>
          <label className="ti-lbl" htmlFor="ti-overgang">Overgangsdatum (getoond als annotatie op het Dashboard)</label>
          <input
            id="ti-overgang" type="date" className="ti-veld"
            value={instellingen.programmaOvergangsdatum ?? ''}
            onChange={veld('programmaOvergangsdatum', (v) => v || null)}
          />
        </div>
      </div>

      <div className="card">
        <div className="td-label">Rusttijden</div>
        <div className="ti-rij">
          <div className="ti-veld-grp">
            <label className="ti-lbl" htmlFor="ti-zw">Squat / Deadlift (sec)</label>
            <GetalVeld id="ti-zw" className="ti-veld" min={60} max={600} step={15} fallback={90}
              value={instellingen.rustZwaar} onCommit={(v) => bewaar({ rustZwaar: v })} />
          </div>
          <div className="ti-veld-grp">
            <label className="ti-lbl" htmlFor="ti-li">Bench / OHP / Row (sec)</label>
            <GetalVeld id="ti-li" className="ti-veld" min={60} max={600} step={15} fallback={90}
              value={instellingen.rustLicht} onCommit={(v) => bewaar({ rustLicht: v })} />
          </div>
        </div>
        <GeluidKiezer
          label="Geluid bij einde rusttimer"
          waarde={instellingen.geluidFragment}
          onWaarde={(v) => bewaar({ geluidFragment: v })}
        />
        <label className="ti-veld-grp" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 'var(--space-xs)', marginTop: 'var(--space-sm)' }}>
          <input
            type="checkbox"
            checked={instellingen.pipAutomatisch}
            onChange={(e) => bewaar({ pipAutomatisch: e.target.checked })}
          />
          <span className="ti-lbl" style={{ margin: 0 }}>Rusttimer automatisch als zwevend venster openen (Android)</span>
        </label>
        <div className="ti-veld-grp" style={{ marginTop: 'var(--space-sm)' }}>
          <label className="ti-lbl" htmlFor="ti-rust-einde">Bij einde rust (terwijl zwevend venster actief was)</label>
          <select
            id="ti-rust-einde" className="ti-veld"
            value={instellingen.rustEindeActie}
            onChange={veld('rustEindeActie')}
          >
            <option value="venster">Venster tonen zodra ik terugkeer naar de app</option>
            <option value="terugNaarApp">App automatisch terug in beeld brengen</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="td-label">Voorkeurstijden lift-/cardio-dag (Agenda)</div>
        <p className="ti-hint">
          Op een liftdag of cardiodag stelt de Agenda deze tijden voor als je een blok inplant — het liefst
          vroeg in de ochtend, met een alternatief later op de dag voor als de ochtend niet lukt.
        </p>
        <div className="ti-rij">
          <div className="ti-veld-grp">
            <label className="ti-lbl" htmlFor="ti-tijd-ochtend">Ochtend</label>
            <input id="ti-tijd-ochtend" type="time" className="ti-veld" value={instellingen.voorkeurTijdOchtend} onChange={veld('voorkeurTijdOchtend')} />
          </div>
          <div className="ti-veld-grp">
            <label className="ti-lbl" htmlFor="ti-tijd-middag">Middag</label>
            <input id="ti-tijd-middag" type="time" className="ti-veld" value={instellingen.voorkeurTijdMiddag} onChange={veld('voorkeurTijdMiddag')} />
          </div>
          <div className="ti-veld-grp">
            <label className="ti-lbl" htmlFor="ti-tijd-avond">Avond</label>
            <input id="ti-tijd-avond" type="time" className="ti-veld" value={instellingen.voorkeurTijdAvond} onChange={veld('voorkeurTijdAvond')} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="td-label">Eenheid</div>
        <div className="ti-rij">
          <button
            type="button"
            className={`btn btn-sm ${instellingen.eenheid !== 'lb' ? 'btn-p' : 'btn-g'}`}
            style={{ flex: 1 }}
            onClick={() => bewaar({ eenheid: 'kg' })}
          >kg</button>
          <button
            type="button"
            className={`btn btn-sm ${instellingen.eenheid === 'lb' ? 'btn-p' : 'btn-g'}`}
            style={{ flex: 1 }}
            onClick={() => bewaar({ eenheid: 'lb' })}
          >lb</button>
        </div>
        <p className="ti-hint">
          Geldt voor overzichten (Dashboard, Mijn profiel). Tijdens een training blijft alles in kg —
          dat zijn de fysieke schijven die je daadwerkelijk oplegt.
        </p>
      </div>

      <div className="card">
        <div className="td-label">Gewichten &amp; stangen</div>
        <div className="ti-veld-grp">
          <label className="ti-lbl">Stapgrootte ± knoppen</label>
          <div className="ti-rij">
            <button
              className={`btn btn-sm ${instellingen.gewichtStap === 1.25 ? 'btn-p' : 'btn-g'}`}
              style={{ flex: 1 }}
              onClick={() => bewaar({ gewichtStap: 1.25 })}
            >1,25 kg</button>
            <button
              className={`btn btn-sm ${instellingen.gewichtStap === 2.5 ? 'btn-p' : 'btn-g'}`}
              style={{ flex: 1 }}
              onClick={() => bewaar({ gewichtStap: 2.5 })}
            >2,5 kg</button>
          </div>
        </div>
        <div className="ti-veld-grp">
          <label className="ti-lbl" htmlFor="ti-stang-recht">Rechte stang (olympische barbell)</label>
          <select id="ti-stang-recht" className="ti-veld" value={instellingen.stangRecht} onChange={veld('stangRecht', parseFloat)}>
            <option value="10">10 kg — lichte stang / dames barbell</option>
            <option value="20">20 kg — standaard olympische stang</option>
          </select>
        </div>
        <div className="ti-veld-grp">
          <label className="ti-lbl" htmlFor="ti-stang-curl">Curl stang (EZ-bar)</label>
          <select id="ti-stang-curl" className="ti-veld" value={instellingen.stangCurl} onChange={veld('stangCurl', parseFloat)}>
            <option value="7.5">7,5 kg</option>
            <option value="10">10 kg</option>
            <option value="12.5">12,5 kg</option>
          </select>
        </div>
        <p className="ti-hint">Beschikbare schijven: 1,25 · 2,5 · 5 · 10 · 20 kg per kant.</p>
      </div>

      <div className="card">
        <div className="td-label">Opbouwsets</div>
        <p className="ti-hint">
          De sets waarmee je opwarmt naar je werkgewicht — telkens een percentage van dat werkgewicht, met
          een eigen aantal reps. Standaard 40/60/80% bij 5/3/2 reps. Geldt niet voor deadlift-achtige
          oefeningen (die hebben altijd hun eigen, kortere opbouw).
        </p>
        <div className="ti-veld-grp">
          <label className="ti-veld-grp" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 'var(--space-xs)' }}>
            <input
              type="checkbox"
              checked={instellingen.opbouwStartGewicht != null}
              onChange={(e) => bewaar({ opbouwStartGewicht: e.target.checked ? instellingen.gewichtStap : null })}
            />
            <span className="ti-lbl" style={{ margin: 0 }}>Eigen startgewicht i.p.v. de lege stang</span>
          </label>
          {instellingen.opbouwStartGewicht != null && (
            <GetalVeld
              className="ti-veld" min={0} step={instellingen.gewichtStap} geheel={false} fallback={0}
              style={{ marginTop: 'var(--space-xs)' }}
              value={instellingen.opbouwStartGewicht}
              onCommit={(v) => bewaar({ opbouwStartGewicht: v })}
            />
          )}
        </div>
        {instellingen.opbouwStappen.map((stap, i) => (
          <div className="ti-rij ti-rij-ob" key={i}>
            <div className="ti-veld-grp">
              <label className="ti-lbl" htmlFor={`ti-ob-pct-${i}`}>Stap {i + 1} — % van werkgewicht</label>
              <GetalVeld
                id={`ti-ob-pct-${i}`} className="ti-veld" min={1} max={99} step={5} fallback={1}
                value={stap.pct} onCommit={pasOpbouwStap(i, 'pct')}
              />
            </div>
            <div className="ti-veld-grp">
              <label className="ti-lbl" htmlFor={`ti-ob-reps-${i}`}>Reps</label>
              <GetalVeld
                id={`ti-ob-reps-${i}`} className="ti-veld" min={1} max={20} step={1} fallback={1}
                value={stap.reps} onCommit={pasOpbouwStap(i, 'reps')}
              />
            </div>
            <button
              type="button" className="btn btn-g btn-sm ti-rij-verwijder" aria-label={`Stap ${i + 1} verwijderen`}
              onClick={() => verwijderOpbouwStap(i)}
            >✕</button>
          </div>
        ))}
        <button type="button" className="btn btn-g btn-sm" onClick={voegOpbouwStapToe}>+ Stap toevoegen</button>
      </div>

      <button className="btn btn-danger btn-sm" onClick={reset}>Trainingsdata wissen</button>
    </div>
  );
}
