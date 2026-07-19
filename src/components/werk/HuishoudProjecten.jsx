import { useState } from 'react';
import { parseSpraakTekst } from '../../lib/werk/tekstParser.js';
import { projectMaandOverzicht, maandLabel } from '../../lib/werk/projectVerdeling.js';
import SpraakInvoer from './SpraakInvoer.jsx';
import './HuishoudProjecten.css';

function NieuwProjectForm({ onToevoegen, onAnnuleren }) {
  const [naam, setNaam] = useState('');
  const [aantalMaanden, setAantalMaanden] = useState(3);
  const [klusjesTekst, setKlusjesTekst] = useState('');

  function submit(e) {
    e.preventDefault();
    const klusjes = parseSpraakTekst(klusjesTekst);
    if (!naam.trim() || klusjes.length === 0) return;
    onToevoegen(naam.trim(), aantalMaanden, klusjes);
  }

  return (
    <form className="hhp-form" onSubmit={submit}>
      <div className="ti-veld-grp">
        <label className="ti-lbl" htmlFor="hhp-naam">Projectnaam</label>
        <input id="hhp-naam" className="ti-veld" value={naam} onChange={(e) => setNaam(e.target.value)} placeholder="bijv. schuur opruimen" />
      </div>
      <div className="ti-veld-grp">
        <label className="ti-lbl" htmlFor="hhp-maanden">Uitgesmeerd over hoeveel maanden</label>
        <input
          id="hhp-maanden" type="number" className="ti-veld" min="1" max="24"
          value={aantalMaanden} onChange={(e) => setAantalMaanden(parseInt(e.target.value) || 1)}
        />
      </div>
      <div className="ti-veld-grp">
        <label className="ti-lbl">Subklusjes (één per regel, komma of &quot;en&quot;)</label>
        <SpraakInvoer waarde={klusjesTekst} onWaarde={setKlusjesTekst} placeholder="bijv. rommel sorteren, oude spullen wegbrengen, schappen ophangen..." />
      </div>
      <p className="ti-hint">
        Elk subklusje krijgt een geschatte duur (standaard 1 uur, aan te passen na aanmaken) — de verdeling
        over maanden houdt daar rekening mee, niet alleen met het aantal klusjes.
      </p>
      <div className="of-acties">
        <button type="button" className="btn btn-text" onClick={onAnnuleren}>Annuleren</button>
        <button type="submit" className="btn btn-p btn-full">Project aanmaken</button>
      </div>
    </form>
  );
}

function ProjectKaart({
  project, gekoppeldeWerktaken, onToggleKlusje, onZetUren, onVerwijderKlusje, onVerwijderProject,
  onToggleWerktaak, onOntkoppelWerktaak,
}) {
  const alleItems = [...project.klusjes, ...gekoppeldeWerktaken.map((t) => ({ afgerond: t.klaar }))];
  const afgerond = alleItems.filter((i) => i.afgerond).length;
  const totaal = alleItems.length;
  const pct = totaal ? Math.round((afgerond / totaal) * 100) : 0;
  const perMaand = projectMaandOverzicht(project.klusjes, gekoppeldeWerktaken, project.aantalMaanden, project.startMaand);

  return (
    <div className="card">
      <div className="hhp-kop">
        <div className="td-label">{project.naam}</div>
        <button className="hh-verwijder" onClick={() => onVerwijderProject(project.id)}>✕</button>
      </div>
      <div className="hhp-voortgang-track"><div className="hhp-voortgang-fill" style={{ width: `${pct}%` }} /></div>
      <div className="hhp-voortgang-lbl">{afgerond}/{totaal} klusjes ({pct}%)</div>

      {perMaand.map(([maand, items]) => (
        <div key={maand} className="hhp-maand">
          <div className="hhp-maand-titel">{maandLabel(maand)}</div>
          <div className="hh-lijst">
            {items.map((item) => {
              const isWerk = item.bron === 'werk';
              return (
                <div className="hh-item" key={item.id}>
                  <button
                    className={`hh-check ${item.afgerond ? 'gedaan' : ''}`}
                    onClick={() => (isWerk ? onToggleWerktaak(item.id) : onToggleKlusje(project.id, item.id))}
                  >
                    {item.afgerond ? '✓' : ''}
                  </button>
                  <span className={`hh-tekst ${item.afgerond ? 'gedaan' : ''}`}>
                    {item.tekst}
                    {isWerk && <span className="hhp-werk-badge"> · werk</span>}
                  </span>
                  {isWerk ? (
                    <span className="hhp-uren-val">{item.geschatteUren}u</span>
                  ) : (
                    <div className="hhp-uren-ctrl">
                      <button className="wt-mini-btn" onClick={() => onZetUren(project.id, item.id, item.geschatteUren - 0.5)}>−</button>
                      <span className="hhp-uren-val">{item.geschatteUren}u</span>
                      <button className="wt-mini-btn" onClick={() => onZetUren(project.id, item.id, item.geschatteUren + 0.5)}>+</button>
                    </div>
                  )}
                  <button
                    className="hh-verwijder"
                    onClick={() => (isWerk ? onOntkoppelWerktaak(item.id) : onVerwijderKlusje(project.id, item.id))}
                    aria-label={isWerk ? 'Ontkoppel van project' : 'Verwijder klusje'}
                    title={isWerk ? 'Ontkoppel van project (taak blijft bestaan in Werktaken)' : undefined}
                  >✕</button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HuishoudProjecten({ projecten, werkTaken, toonToast }) {
  const [toonForm, setToonForm] = useState(false);

  function toevoegen(naam, aantalMaanden, klusjes) {
    projecten.voegProjectToe(naam, aantalMaanden, klusjes);
    setToonForm(false);
    toonToast(`Project "${naam}" aangemaakt met ${klusjes.length} klusjes`, 'ok');
  }

  return (
    <div>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Kluslijst</div>
      <p className="of-stap-tekst">
        Grote klussen opgedeeld in kleinere subklusjes, verspreid over meerdere maanden — zodat je stap voor
        stap naar het eindresultaat toewerkt in plaats van tegen één grote taak op te kijken.
      </p>

      {projecten.projecten.length === 0 && !toonForm && (
        <p className="of-stap-tekst">Nog geen projecten.</p>
      )}

      {projecten.projecten.map((project) => (
        <ProjectKaart
          key={project.id}
          project={project}
          gekoppeldeWerktaken={werkTaken.alleTaken.filter((t) => t.projectId === project.id)}
          onToggleKlusje={projecten.toggleKlusje}
          onZetUren={projecten.zetGeschatteUren}
          onVerwijderKlusje={projecten.verwijderKlusje}
          onVerwijderProject={projecten.verwijderProject}
          onToggleWerktaak={werkTaken.toggleKlaar}
          onOntkoppelWerktaak={(id) => werkTaken.zetProject(id, null)}
        />
      ))}

      {toonForm ? (
        <div className="card">
          <NieuwProjectForm onToevoegen={toevoegen} onAnnuleren={() => setToonForm(false)} />
        </div>
      ) : (
        <button className="btn btn-g btn-full" onClick={() => setToonForm(true)}>+ Nieuw project</button>
      )}
    </div>
  );
}
