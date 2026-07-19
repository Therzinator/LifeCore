import { KOMPAS_CADANS_OPTIES } from '../../lib/act/kompas.js';

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

      <div className="card">
        <div className="td-label">Waardenkompas — hoe vaak invullen</div>
        <div className="ti-rij">
          {KOMPAS_CADANS_OPTIES.map((o) => (
            <button
              key={o.dagen}
              type="button"
              className={`btn btn-sm ${instellingen.kompasCadansDagen === o.dagen ? 'btn-p' : 'btn-g'}`}
              style={{ flex: 1 }}
              onClick={() => bewaar({ kompasCadansDagen: o.dagen })}
            >{o.label}</button>
          ))}
        </div>
        <p className="ti-hint">Bepaalt wanneer het kompas als &ldquo;weer aan de beurt&rdquo; wordt getoond.</p>
      </div>
    </div>
  );
}
