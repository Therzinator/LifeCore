import { useState } from 'react';
import { PROFIELEN } from '../../lib/training/schema.js';
import './PersoonsProfiel.css';

const PROFIEL_INFO = {
  licht: { icoon: '🪶', titel: 'Licht', sub: `Squat start ${PROFIELEN.licht.squat} kg` },
  midden: { icoon: '🏋', titel: 'Midden', sub: `Squat start ${PROFIELEN.midden.squat} kg` },
  zwaar: { icoon: '🏆', titel: 'Zwaar', sub: `Squat start ${PROFIELEN.zwaar.squat} kg` },
};

const NAMEN = { squat: 'Squat', bench: 'Bench Press', ohp: 'OHP', deadlift: 'Deadlift', row: 'Barbell Row' };

export default function PersoonsProfiel({ persoonsProfiel, trainingProfiel, instellingen, toonToast }) {
  const [naam, setNaam] = useState(persoonsProfiel.profiel.naam ?? '');
  const [geslacht, setGeslacht] = useState(persoonsProfiel.profiel.geslacht ?? '');
  const [leeftijd, setLeeftijd] = useState(persoonsProfiel.profiel.leeftijd ?? '');
  const [lengte, setLengte] = useState(persoonsProfiel.profiel.lengte ?? '');
  const [lichaamsgewicht, setLichaamsgewicht] = useState(persoonsProfiel.profiel.lichaamsgewicht ?? '');
  const [gekozenProfiel, setGekozenProfiel] = useState(trainingProfiel.profiel.profielNaam ?? 'licht');
  const [delta, setDelta] = useState(0);

  const basis = PROFIELEN[gekozenProfiel];

  function opslaan() {
    persoonsProfiel.bewaar({
      naam: naam.trim(),
      geslacht,
      leeftijd: leeftijd ? parseInt(leeftijd) : null,
      lengte: lengte ? parseInt(lengte) : null,
      lichaamsgewicht: lichaamsgewicht ? parseFloat(lichaamsgewicht) : null,
    });
    trainingProfiel.stelGewichtenIn(gekozenProfiel, delta);
    setDelta(0);
    toonToast('Profiel opgeslagen', 'ok');
  }

  return (
    <div>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Mijn profiel</div>
      <p className="of-stap-tekst">Persoonsgegevens en trainingsprofiel.</p>

      <div className="card">
        <div className="td-label">Persoonsgegevens</div>
        <div className="pp-grid">
          <div className="ti-veld-grp">
            <label className="ti-lbl" htmlFor="pp-naam">Naam</label>
            <input id="pp-naam" className="ti-veld" value={naam} onChange={(e) => setNaam(e.target.value)} placeholder="Jouw naam" />
          </div>
          <div className="ti-veld-grp">
            <label className="ti-lbl" htmlFor="pp-geslacht">Geslacht</label>
            <select id="pp-geslacht" className="ti-veld" value={geslacht} onChange={(e) => setGeslacht(e.target.value)}>
              <option value="">— kies —</option>
              <option value="man">Man</option>
              <option value="vrouw">Vrouw</option>
              <option value="anders">Anders / niet vermeld</option>
            </select>
          </div>
          <div className="ti-veld-grp">
            <label className="ti-lbl" htmlFor="pp-leeftijd">Leeftijd</label>
            <input id="pp-leeftijd" type="number" className="ti-veld" min="10" max="100" value={leeftijd} onChange={(e) => setLeeftijd(e.target.value)} placeholder="bijv. 32" />
          </div>
          <div className="ti-veld-grp">
            <label className="ti-lbl" htmlFor="pp-lengte">Lengte (cm)</label>
            <input id="pp-lengte" type="number" className="ti-veld" min="100" max="250" value={lengte} onChange={(e) => setLengte(e.target.value)} placeholder="bijv. 182" />
          </div>
          <div className="ti-veld-grp">
            <label className="ti-lbl" htmlFor="pp-gewicht">Lichaamsgewicht (kg)</label>
            <input id="pp-gewicht" type="number" className="ti-veld" min="30" max="300" step="0.5" value={lichaamsgewicht} onChange={(e) => setLichaamsgewicht(e.target.value)} placeholder="bijv. 82.5" />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="td-label">Trainingsprofiel</div>
        <div className="pp-profielen">
          {Object.keys(PROFIEL_INFO).map((naamProfiel) => (
            <button
              key={naamProfiel}
              className={`pp-profiel-kaart ${gekozenProfiel === naamProfiel ? 'sel' : ''}`}
              onClick={() => setGekozenProfiel(naamProfiel)}
            >
              <div className="pp-profiel-icoon">{PROFIEL_INFO[naamProfiel].icoon}</div>
              <div className="pp-profiel-titel">{PROFIEL_INFO[naamProfiel].titel}</div>
              <div className="pp-profiel-sub">{PROFIEL_INFO[naamProfiel].sub}</div>
            </button>
          ))}
        </div>

        <div className="pp-delta-rij">
          <div>
            <div>Alle startgewichten aanpassen</div>
            <div className="ti-hint">Past alle lifts tegelijk aan</div>
          </div>
          <div className="ti-rij" style={{ gap: 6 }}>
            <button className="ts-mini-btn" onClick={() => setDelta((d) => d - instellingen.gewichtStap)}>−</button>
            <span className="ts-set-waarde">{Math.max(1.25, Math.round((basis.squat + delta) * 100) / 100)} kg</span>
            <button className="ts-mini-btn" onClick={() => setDelta((d) => d + instellingen.gewichtStap)}>+</button>
          </div>
        </div>

        <div className="pp-gewichten-grid">
          {Object.entries(basis).map(([id, gewicht]) => (
            <div className="metric" key={id}>
              <div className="ml">{NAMEN[id]}</div>
              <div className="mv" style={{ fontSize: 'var(--font-size-base)' }}>
                {Math.max(1.25, Math.round((gewicht + delta) * 100) / 100)} <span className="mu">kg</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className="btn btn-p btn-full" onClick={opslaan}>Opslaan</button>
    </div>
  );
}
