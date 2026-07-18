export default function WaardenInstellingen({ instellingen, bewaar }) {
  return (
    <div>
      <div className="card">
        <div className="td-label">Kruismodule-suggesties</div>
        <div className="ti-rij">
          <button
            type="button"
            className={`btn btn-sm ${instellingen.toonWelzijnSuggesties ? 'btn-p' : 'btn-g'}`}
            style={{ flex: 1 }}
            onClick={() => bewaar({ toonWelzijnSuggesties: true })}
          >Aan</button>
          <button
            type="button"
            className={`btn btn-sm ${!instellingen.toonWelzijnSuggesties ? 'btn-p' : 'btn-g'}`}
            style={{ flex: 1 }}
            onClick={() => bewaar({ toonWelzijnSuggesties: false })}
          >Uit</button>
        </div>
        <p className="ti-hint">Toon suggesties vanuit de welzijnscheck — bijv. als je hersteltrend aandacht vraagt.</p>
      </div>
    </div>
  );
}
