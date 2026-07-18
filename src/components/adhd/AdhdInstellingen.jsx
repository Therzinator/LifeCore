import './AdhdInstellingen.css';

export default function AdhdInstellingen({ instellingen, bewaar, onResetAlles, toonToast }) {
  function reset() {
    if (!window.confirm('Alle Focus-data wissen (taken, klusboek, geschiedenis van vandaag)? Dit is onomkeerbaar.')) return;
    onResetAlles();
    toonToast('Focus-data gewist', 'neu');
  }

  return (
    <div>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Instellingen</div>
      <p className="of-stap-tekst">Werkuren en dagvenster — de basis voor je daglimiet en het stopmoment.</p>

      <div className="card">
        <div className="td-label">Werkvenster</div>
        <div className="ains-rij">
          <label className="ains-veld-grp">
            <span className="ains-lbl">Starttijd</span>
            <input
              type="time" className="ains-veld" value={instellingen.starttijd}
              onChange={(e) => bewaar({ starttijd: e.target.value })}
            />
          </label>
          <label className="ains-veld-grp">
            <span className="ains-lbl">Stopmoment</span>
            <input
              type="time" className="ains-veld" value={instellingen.eindtijd}
              onChange={(e) => bewaar({ eindtijd: e.target.value })}
            />
          </label>
        </div>
        <label className="ains-veld-grp">
          <span className="ains-lbl">Werkuren per dag (volle daglimiet bij hoge energie)</span>
          <input
            type="number" className="ains-veld" min="1" max="12" step="0.5"
            value={instellingen.werkurenPerDag}
            onChange={(e) => bewaar({ werkurenPerDag: parseFloat(e.target.value) || 8 })}
          />
        </label>
        <p className="ains-hint">
          Bezig met reintegreren? Zet dit lager (bijv. 3–4 uur) en bouw wekelijks rustig op.
          Bij lage energie krijg je automatisch de helft van dit aantal uren, bij midden 75%.
        </p>
      </div>

      <button className="btn btn-danger btn-sm" onClick={reset}>Focus-data wissen</button>
    </div>
  );
}
