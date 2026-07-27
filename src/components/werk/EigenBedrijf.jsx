import { useState } from 'react';
import { maandagVan, vandaagKey } from '../../utils/datum.js';
import { geplandeMinuten } from '../../lib/eigenbedrijf/blokken.js';
import { weekTotalen } from '../../lib/eigenbedrijf/uren.js';
import SpraakInvoer from './SpraakInvoer.jsx';
import GetalVeld from '../ui/GetalVeld.jsx';
import EigenBedrijfToets from './EigenBedrijfToets.jsx';
import './EigenBedrijf.css';

const CATEGORIE_LABEL = {
  facturabel: 'Facturabel (Meten=Weten/Constatum)',
  platform: 'Eigen platform (niet-facturabel)',
};

function urenLabel(minuten) {
  const uren = Math.floor(minuten / 60);
  const rest = minuten % 60;
  return uren > 0 ? `${uren}u ${rest}m` : `${rest}m`;
}

// TJB Solutions-tab binnen Werk — loggen (hergebruikt SpraakInvoer, zelfde
// patroon als WerkTaken.jsx), gepland-vs-gelogd per potje, het
// zondag-toetsmoment en de geschiedenis. Bewust geen los tabblad/module:
// zie het architectuurbesluit in de opdracht (hergebruik bestaande
// Werk-context i.p.v. een parallelle nieuwe module).
export default function EigenBedrijf({ instellingen, sessies, toetsen, toonToast, overschrijdingSignaal }) {
  const [tekst, setTekst] = useState('');
  const [categorie, setCategorie] = useState('facturabel');
  const [minuten, setMinuten] = useState(30);
  const [datum, setDatum] = useState(vandaagKey());

  function sessieLoggen() {
    sessies.voegToe({ minuten, categorie, tekst, datum });
    setTekst('');
    toonToast(`Sessie gelogd — ${urenLabel(minuten)} ${CATEGORIE_LABEL[categorie]}`, 'ok');
  }

  const gepland = geplandeMinuten(instellingen.blokken);
  const gelogd = weekTotalen(sessies.sessies, maandagVan(vandaagKey()));
  const geschiedenis = [...sessies.sessies].sort((a, b) => b.datum.localeCompare(a.datum) || b.id - a.id);

  return (
    <div>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Eigen bedrijf</div>
      <p className="of-stap-tekst">
        Gestructureerde tijd voor TJB Solutions — met een duidelijke grens tussen factureerbaar werk en eigen
        platformontwikkeling, zodat het een tweede baan blijft in plaats van een grenzeloze hobby.
      </p>

      {overschrijdingSignaal && <div className="ad-banner warn">{overschrijdingSignaal}</div>}

      <div className="card">
        <div className="td-label">Sessie loggen</div>
        <SpraakInvoer waarde={tekst} onWaarde={setTekst} placeholder="Waar heb je aan gewerkt?" />
        <div className="ti-rij" style={{ marginTop: 'var(--space-sm)' }}>
          <div className="ti-veld-grp" style={{ flex: 1 }}>
            <label className="ti-lbl" htmlFor="eb-categorie">Categorie</label>
            <select id="eb-categorie" className="ti-veld" value={categorie} onChange={(e) => setCategorie(e.target.value)}>
              <option value="facturabel">Facturabel</option>
              <option value="platform">Eigen platform</option>
            </select>
          </div>
          <div className="ti-veld-grp" style={{ flex: 1 }}>
            <label className="ti-lbl" htmlFor="eb-minuten">Minuten</label>
            <GetalVeld
              id="eb-minuten" className="ti-veld" min={5} max={480} step={5} fallback={30}
              value={minuten} onCommit={setMinuten}
            />
          </div>
        </div>
        <div className="ti-veld-grp" style={{ marginTop: 'var(--space-sm)' }}>
          <label className="ti-lbl" htmlFor="eb-datum">Datum</label>
          <input id="eb-datum" type="date" className="ti-veld" value={datum} onChange={(e) => setDatum(e.target.value)} />
        </div>
        <button className="btn btn-p btn-full" style={{ marginTop: 'var(--space-sm)' }} onClick={sessieLoggen}>
          Sessie loggen
        </button>
      </div>

      <div className="card">
        <div className="td-label">Deze week — gepland vs. gelogd</div>
        <div className="td-grid">
          <div className="metric">
            <div className="ml">Facturabel gepland</div>
            <div className="mv">{urenLabel(gepland.facturabel)}</div>
          </div>
          <div className="metric">
            <div className="ml">Facturabel gelogd</div>
            <div className="mv">{urenLabel(gelogd.facturabel)}</div>
          </div>
          <div className="metric">
            <div className="ml">Platform gepland</div>
            <div className="mv">{urenLabel(gepland.platform)}</div>
          </div>
          <div className="metric">
            <div className="ml">Platform gelogd</div>
            <div className="mv">{urenLabel(gelogd.platform)}</div>
          </div>
        </div>
      </div>

      <EigenBedrijfToets instellingen={instellingen} sessies={sessies} toetsen={toetsen} toonToast={toonToast} />

      <div className="card">
        <div className="td-label">Geschiedenis</div>
        {geschiedenis.length === 0 && <p className="of-stap-tekst">Nog niets gelogd.</p>}
        <div className="eb-lijst">
          {geschiedenis.map((s) => (
            <div className="eb-item" key={s.id}>
              <span className="eb-item-datum">{s.datum}</span>
              <span className="eb-item-tekst">
                {s.tekst || CATEGORIE_LABEL[s.categorie]}
                <span className="eb-item-categorie"> · {CATEGORIE_LABEL[s.categorie] ?? s.categorie}</span>
              </span>
              <span className="eb-item-duur">{urenLabel(s.minuten)}</span>
              <button className="eb-verwijder" onClick={() => sessies.verwijder(s.id)} aria-label="Sessie verwijderen">✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
