import './TrainingInstellingen.css';

export default function TrainingInstellingen({ instellingen, bewaar, onResetAlles, toonToast }) {
  function veld(key, parse = (v) => v) {
    return (e) => bewaar({ [key]: parse(e.target.value) });
  }

  function reset() {
    if (!window.confirm('Alle trainingsdata wissen? Dit is onomkeerbaar.')) return;
    onResetAlles();
    toonToast('Trainingsdata gewist', 'neu');
  }

  return (
    <div>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Instellingen</div>
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
      </div>

      <div className="card">
        <div className="td-label">Rusttijden</div>
        <div className="ti-rij">
          <div className="ti-veld-grp">
            <label className="ti-lbl" htmlFor="ti-zw">Squat / Deadlift (sec)</label>
            <input id="ti-zw" type="number" className="ti-veld" min="60" max="600" step="15"
              value={instellingen.rustZwaar} onChange={veld('rustZwaar', (v) => parseInt(v) || 90)} />
          </div>
          <div className="ti-veld-grp">
            <label className="ti-lbl" htmlFor="ti-li">Bench / OHP / Row (sec)</label>
            <input id="ti-li" type="number" className="ti-veld" min="60" max="600" step="15"
              value={instellingen.rustLicht} onChange={veld('rustLicht', (v) => parseInt(v) || 90)} />
          </div>
        </div>
        <p className="ti-hint">Geluid voor deze timer zet je in Algemene instellingen (tandwiel bovenin).</p>
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

      <button className="btn btn-danger btn-sm" onClick={reset}>Trainingsdata wissen</button>
    </div>
  );
}
