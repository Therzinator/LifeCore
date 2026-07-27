import GetalVeld from '../ui/GetalVeld.jsx';
import './EigenBedrijfInstellingen.css';

const DAGEN = [
  { nr: 1, label: 'Ma' },
  { nr: 2, label: 'Di' },
  { nr: 3, label: 'Wo' },
  { nr: 4, label: 'Do' },
  { nr: 5, label: 'Vr' },
  { nr: 6, label: 'Za' },
  { nr: 7, label: 'Zo' },
];

const SOORTEN = [
  { id: 'facturabel', label: 'Facturabel' },
  { id: 'platform', label: 'Eigen platform' },
  { id: 'flexibel', label: 'Flexibel' },
  { id: 'toets', label: 'Toetsmoment' },
];

// Instelbaar weekpatroon voor TJB Solutions — geen vast gegeven (zie
// opdracht): dag, tijden en soort per blok zijn allemaal aanpasbaar, en er
// kunnen blokken bij of af. Zelfde opzet als WerkInstellingen.jsx
// (dag-picker) en AdhdInstellingen.jsx (GetalVeld voor drempels).
export default function EigenBedrijfInstellingen({ instellingen, bewaar, voegBlokToe, werkBlokBij, verwijderBlok }) {
  return (
    <div>
      <p className="of-stap-tekst">
        Het vaste weekpatroon voor TJB Solutions — factureerbaar (Meten=Weten/Constatum), eigen platform, een
        flexibel blok en het zondag-toetsmoment. Pas gerust aan als het in de praktijk niet blijkt te passen.
      </p>

      <div className="card">
        <div className="td-label">Vaste blokken</div>
        {instellingen.blokken.map((blok) => (
          <div className="ebi-blok" key={blok.id}>
            <div className="ti-rij">
              {DAGEN.map((d) => (
                <button
                  key={d.nr}
                  type="button"
                  className={`btn btn-sm ${blok.dagNr === d.nr ? 'btn-p' : 'btn-g'}`}
                  style={{ flex: 1 }}
                  onClick={() => werkBlokBij(blok.id, { dagNr: d.nr })}
                >{d.label}</button>
              ))}
            </div>
            <div className="ti-rij" style={{ marginTop: 'var(--space-xs)' }}>
              <div className="ti-veld-grp" style={{ flex: 1 }}>
                <label className="ti-lbl">Start</label>
                <input
                  type="time" className="ti-veld" value={blok.start}
                  onChange={(e) => werkBlokBij(blok.id, { start: e.target.value })}
                />
              </div>
              <div className="ti-veld-grp" style={{ flex: 1 }}>
                <label className="ti-lbl">Eind</label>
                <input
                  type="time" className="ti-veld" value={blok.eind}
                  onChange={(e) => werkBlokBij(blok.id, { eind: e.target.value })}
                />
              </div>
            </div>
            <div className="ti-rij" style={{ marginTop: 'var(--space-xs)', flexWrap: 'wrap' }}>
              {SOORTEN.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`btn btn-sm ${blok.soort === s.id ? 'btn-p' : 'btn-g'}`}
                  style={{ flex: 1 }}
                  onClick={() => werkBlokBij(blok.id, { soort: s.id })}
                >{s.label}</button>
              ))}
            </div>
            <button type="button" className="ebi-verwijder" onClick={() => verwijderBlok(blok.id)}>
              Blok verwijderen
            </button>
          </div>
        ))}
        <button type="button" className="btn btn-sm btn-g btn-full" onClick={() => voegBlokToe({})}>
          + Blok toevoegen
        </button>
      </div>

      <div className="card">
        <div className="td-label">Signaal bij overschrijding</div>
        <div className="ti-rij">
          <button
            type="button"
            className={`btn btn-sm ${instellingen.signaalActief ? 'btn-p' : 'btn-g'}`}
            style={{ flex: 1 }}
            onClick={() => bewaar({ signaalActief: true })}
          >Aan</button>
          <button
            type="button"
            className={`btn btn-sm ${!instellingen.signaalActief ? 'btn-p' : 'btn-g'}`}
            style={{ flex: 1 }}
            onClick={() => bewaar({ signaalActief: false })}
          >Uit</button>
        </div>
        <div className="ti-rij" style={{ marginTop: 'var(--space-sm)' }}>
          <div className="ti-veld-grp" style={{ flex: 1 }}>
            <label className="ti-lbl" htmlFor="ebi-weken">Weken op rij</label>
            <GetalVeld
              id="ebi-weken" className="ti-veld" min={1} max={8} step={1} fallback={2}
              value={instellingen.signaalWekenOpRij}
              onCommit={(v) => bewaar({ signaalWekenOpRij: v })}
            />
          </div>
          <div className="ti-veld-grp" style={{ flex: 1 }}>
            <label className="ti-lbl" htmlFor="ebi-pct">% boven schema</label>
            <GetalVeld
              id="ebi-pct" className="ti-veld" min={5} max={200} step={5} fallback={25}
              value={instellingen.signaalPctBovenSchema}
              onCommit={(v) => bewaar({ signaalPctBovenSchema: v })}
            />
          </div>
        </div>
        <p className="ti-hint">
          Bij zoveel weken op rij ruim boven het geplande aantal uren komt er een zachte melding — geen
          blokkade, gewoon een moment om te kijken of het schema nog klopt.
        </p>
      </div>
    </div>
  );
}
