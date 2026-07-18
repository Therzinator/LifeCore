export default function WelzijnInstellingen({ instellingen, bewaar }) {
  return (
    <div>
      <div className="card">
        <div className="td-label">Check-cadans</div>
        <div className="ti-veld-grp">
          <label className="ti-lbl" htmlFor="wzi-cadans">Elke hoeveel dagen een nieuwe check</label>
          <input
            id="wzi-cadans" type="number" className="ti-veld" min="7" max="60" step="1"
            value={instellingen.cadansDagen}
            onChange={(e) => bewaar({ cadansDagen: parseInt(e.target.value) || 14 })}
          />
        </div>
        <p className="ti-hint">Standaard elke 14 dagen — vaker gemeten geeft een gevoeliger trend, maar ook meer ruis per punt.</p>
      </div>

      <div className="card">
        <div className="td-label">Koppeling naar Mindfulness</div>
        <div className="ti-veld-grp">
          <label className="ti-lbl" htmlFor="wzi-impact">
            Impactpercentage ({instellingen.mindfulnessImpactPct}%)
          </label>
          <input
            id="wzi-impact" type="range" className="ti-veld" min="0" max="100" step="10"
            value={instellingen.mindfulnessImpactPct}
            onChange={(e) => bewaar({ mindfulnessImpactPct: parseInt(e.target.value) })}
          />
        </div>
        <p className="ti-hint">
          Hoger % = een ademoefening-suggestie in Mindfulness verschijnt al bij een lichtere uitputtingsscore.
          0% zet de koppeling volledig uit.
        </p>
      </div>
    </div>
  );
}
