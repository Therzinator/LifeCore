import GeluidKiezer from '../ui/GeluidKiezer.jsx';
import { STAP_LABELS } from '../../hooks/useOchtendInstellingen.js';

function verplaats(volgorde, index, richting) {
  const doel = index + richting;
  if (doel < 0 || doel >= volgorde.length) return volgorde;
  const nieuw = [...volgorde];
  [nieuw[index], nieuw[doel]] = [nieuw[doel], nieuw[index]];
  return nieuw;
}

export default function OchtendInstellingen({ instellingen, bewaar }) {
  const volgorde = instellingen.stappenVolgorde;
  const aan = instellingen.stappenAan;

  return (
    <div>
      <div className="card">
        <div className="td-label">Starttijd</div>
        <div className="ti-veld-grp">
          <label className="ti-lbl" htmlFor="of-starttijd">Gewenste starttijd van de ochtendroutine</label>
          <input
            id="of-starttijd"
            type="time"
            className="ti-veld"
            value={instellingen.starttijd}
            onChange={(e) => bewaar({ starttijd: e.target.value })}
          />
        </div>
        <p className="ti-hint">Puur informatief — er is nog geen herinnering/melding hieraan gekoppeld.</p>
      </div>

      <div className="card">
        <div className="td-label">Stappen</div>
        <p className="ti-hint">Welke stappen meedoen, en in welke volgorde. Welkom en afsluiten staan altijd vast.</p>
        {volgorde.map((id, i) => (
          <div key={id} className="ti-rij" style={{ alignItems: 'center', marginTop: 'var(--space-xs)' }}>
            <button
              type="button"
              className={`btn btn-sm ${aan[id] !== false ? 'btn-p' : 'btn-g'}`}
              style={{ flex: 1, textAlign: 'left' }}
              onClick={() => bewaar({ stappenAan: { ...aan, [id]: aan[id] === false } })}
            >
              {aan[id] !== false ? '✓ ' : ''}{STAP_LABELS[id]}
            </button>
            <button
              type="button"
              className="btn btn-sm btn-g"
              disabled={i === 0}
              onClick={() => bewaar({ stappenVolgorde: verplaats(volgorde, i, -1) })}
              aria-label={`${STAP_LABELS[id]} omhoog`}
            >↑</button>
            <button
              type="button"
              className="btn btn-sm btn-g"
              disabled={i === volgorde.length - 1}
              onClick={() => bewaar({ stappenVolgorde: verplaats(volgorde, i, 1) })}
              aria-label={`${STAP_LABELS[id]} omlaag`}
            >↓</button>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="td-label">Kruismodule-koppeling</div>
        <div className="ti-rij">
          <button
            type="button"
            className={`btn btn-sm ${instellingen.toonTrainingsherinnering ? 'btn-p' : 'btn-g'}`}
            style={{ flex: 1 }}
            onClick={() => bewaar({ toonTrainingsherinnering: true })}
          >Aan</button>
          <button
            type="button"
            className={`btn btn-sm ${!instellingen.toonTrainingsherinnering ? 'btn-p' : 'btn-g'}`}
            style={{ flex: 1 }}
            onClick={() => bewaar({ toonTrainingsherinnering: false })}
          >Uit</button>
        </div>
        <p className="ti-hint">Toon trainingsherinnering in ochtendroutine — bij de activering-stap, als het 3+ weken geleden is sinds je laatste training.</p>
      </div>

      <div className="card">
        <div className="td-label">Geluid</div>
        <GeluidKiezer
          label="Geluid bij einde plank-timer, kindhouding-timer & ademhalingsprogramma"
          waarde={instellingen.geluidFragment}
          onWaarde={(v) => bewaar({ geluidFragment: v })}
        />
      </div>
    </div>
  );
}
