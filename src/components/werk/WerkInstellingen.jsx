import { useState } from 'react';
import './WerkInstellingen.css';

const DAGEN = [
  { nr: 1, label: 'Ma' },
  { nr: 2, label: 'Di' },
  { nr: 3, label: 'Wo' },
  { nr: 4, label: 'Do' },
  { nr: 5, label: 'Vr' },
  { nr: 6, label: 'Za' },
  { nr: 7, label: 'Zo' },
];

export default function WerkInstellingen({ instellingen, bewaar, voegCategorieToe, hernoemCategorie, verwijderCategorie, werkProjecten }) {
  const [nieuweCategorie, setNieuweCategorie] = useState('');
  const [bewerkCategorie, setBewerkCategorie] = useState(null);
  const [bewerkWaarde, setBewerkWaarde] = useState('');
  const [nieuwProject, setNieuwProject] = useState('');
  const [bewerkProject, setBewerkProject] = useState(null);
  const [bewerkProjectWaarde, setBewerkProjectWaarde] = useState('');

  function bewerkenStarten(naam) {
    setBewerkCategorie(naam);
    setBewerkWaarde(naam);
  }

  function bewerkenOpslaan() {
    hernoemCategorie(bewerkCategorie, bewerkWaarde);
    setBewerkCategorie(null);
  }

  function projectBewerkenStarten(project) {
    setBewerkProject(project.id);
    setBewerkProjectWaarde(project.naam);
  }

  function projectBewerkenOpslaan() {
    werkProjecten.hernoemProject(bewerkProject, bewerkProjectWaarde);
    setBewerkProject(null);
  }

  function wisselDag(nr) {
    const werkdagen = instellingen.werkdagen.includes(nr)
      ? instellingen.werkdagen.filter((d) => d !== nr)
      : [...instellingen.werkdagen, nr].sort();
    bewaar({ werkdagen });
  }

  function categorieToevoegen() {
    voegCategorieToe(nieuweCategorie);
    setNieuweCategorie('');
  }

  function projectToevoegen() {
    werkProjecten.voegProjectToe(nieuwProject);
    setNieuwProject('');
  }

  return (
    <div>
      <div className="card">
        <div className="td-label">Werkdag-check</div>
        <div className="ti-veld-grp">
          <label className="ti-lbl" htmlFor="wi-starttijd">Starttijd</label>
          <input
            id="wi-starttijd" type="time" className="ti-veld"
            value={instellingen.starttijd} onChange={(e) => bewaar({ starttijd: e.target.value })}
          />
        </div>
        <label className="ti-lbl">Werkdagen</label>
        <div className="ti-rij">
          {DAGEN.map((d) => (
            <button
              key={d.nr}
              type="button"
              className={`btn btn-sm ${instellingen.werkdagen.includes(d.nr) ? 'btn-p' : 'btn-g'}`}
              style={{ flex: 1 }}
              onClick={() => wisselDag(d.nr)}
            >{d.label}</button>
          ))}
        </div>

        <label className="ti-lbl" style={{ marginTop: 'var(--space-sm)' }}>Klusjes-dag</label>
        <div className="ti-rij">
          {DAGEN.map((d) => (
            <button
              key={d.nr}
              type="button"
              className={`btn btn-sm ${instellingen.klusjesDag === d.nr ? 'btn-p' : 'btn-g'}`}
              style={{ flex: 1 }}
              onClick={() => bewaar({ klusjesDag: instellingen.klusjesDag === d.nr ? null : d.nr })}
            >{d.label}</button>
          ))}
        </div>
        <p className="ti-hint">
          Vaste, terugkerende dag voor grotere Kluslijst-klusjes (2-3u) — de Agenda toont die dag als Klusjes-dag
          met suggesties, met de mogelijkheid een specifieke week af te wijken via de dagweergave.
        </p>
      </div>

      <div className="card">
        <div className="td-label">Taakcategorieën</div>
        <div className="ti-rij" style={{ flexWrap: 'wrap' }}>
          {instellingen.categorieen.map((c) => (
            bewerkCategorie === c ? (
              <span key={c} className="wi-categorie-bewerk">
                <input
                  className="ti-veld wi-categorie-invoer"
                  value={bewerkWaarde}
                  autoFocus
                  onChange={(e) => setBewerkWaarde(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') bewerkenOpslaan(); if (e.key === 'Escape') setBewerkCategorie(null); }}
                  onBlur={bewerkenOpslaan}
                />
              </span>
            ) : (
              <span key={c} className="wi-categorie-chip">
                <button type="button" className="btn btn-sm btn-g" onClick={() => bewerkenStarten(c)}>{c}</button>
                <button type="button" className="wi-categorie-verwijder" onClick={() => verwijderCategorie(c)} aria-label={`${c} verwijderen`}>✕</button>
              </span>
            )
          ))}
        </div>
        <p className="ti-hint">Tik op een categorie om de naam aan te passen.</p>
        <div className="ti-rij" style={{ marginTop: 'var(--space-sm)' }}>
          <input
            className="ti-veld" style={{ flex: 1 }} value={nieuweCategorie}
            onChange={(e) => setNieuweCategorie(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') categorieToevoegen(); }}
            placeholder="Nieuwe categorie"
          />
          <button type="button" className="btn btn-sm btn-p" onClick={categorieToevoegen}>Toevoegen</button>
        </div>
      </div>

      <div className="card">
        <div className="td-label">Projecten</div>
        <p className="ti-hint">Eigen projecten om werktaken aan te taggen — los van de Kluslijst-projecten bij Thuis.</p>
        <div className="ti-rij" style={{ flexWrap: 'wrap' }}>
          {werkProjecten.projecten.map((p) => (
            bewerkProject === p.id ? (
              <span key={p.id} className="wi-categorie-bewerk">
                <input
                  className="ti-veld wi-categorie-invoer"
                  value={bewerkProjectWaarde}
                  autoFocus
                  onChange={(e) => setBewerkProjectWaarde(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') projectBewerkenOpslaan(); if (e.key === 'Escape') setBewerkProject(null); }}
                  onBlur={projectBewerkenOpslaan}
                />
              </span>
            ) : (
              <span key={p.id} className="wi-categorie-chip">
                <button type="button" className="btn btn-sm btn-g" onClick={() => projectBewerkenStarten(p)}>{p.naam}</button>
                <button type="button" className="wi-categorie-verwijder" onClick={() => werkProjecten.verwijderProject(p.id)} aria-label={`${p.naam} verwijderen`}>✕</button>
              </span>
            )
          ))}
        </div>
        <p className="ti-hint">Tik op een project om de naam aan te passen.</p>
        <div className="ti-rij" style={{ marginTop: 'var(--space-sm)' }}>
          <input
            className="ti-veld" style={{ flex: 1 }} value={nieuwProject}
            onChange={(e) => setNieuwProject(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') projectToevoegen(); }}
            placeholder="Nieuw project"
          />
          <button type="button" className="btn btn-sm btn-p" onClick={projectToevoegen}>Toevoegen</button>
        </div>
      </div>

      <div className="card">
        <div className="td-label">Gemeente Oldambt-koppeling</div>
        <div className="ti-rij">
          <button
            type="button"
            className={`btn btn-sm ${!instellingen.oldambtModus ? 'btn-p' : 'btn-g'}`}
            style={{ flex: 1 }}
            onClick={() => bewaar({ oldambtModus: false })}
          >Uit — generiek</button>
          <button
            type="button"
            className={`btn btn-sm ${instellingen.oldambtModus ? 'btn-p' : 'btn-g'}`}
            style={{ flex: 1 }}
            onClick={() => bewaar({ oldambtModus: true })}
          >Aan — Oldambt</button>
        </div>
        <p className="ti-hint">Wisselt alleen labels en voorbeeldteksten in de Werk-module — geen koppeling met een extern systeem.</p>
      </div>
    </div>
  );
}
