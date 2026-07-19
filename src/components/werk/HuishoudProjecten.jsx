import { useEffect, useRef, useState } from 'react';
import { parseSpraakTekst } from '../../lib/werk/tekstParser.js';
import { projectMaandOverzicht, maandLabel, dagenTotDeadline, isGeblokkeerd } from '../../lib/werk/projectVerdeling.js';
import { vandaagKey } from '../../utils/datum.js';
import SpraakInvoer from './SpraakInvoer.jsx';
import WerkvoorbereidingLijst from './WerkvoorbereidingLijst.jsx';
import './HuishoudProjecten.css';

function NieuwProjectForm({ onToevoegen, onAnnuleren }) {
  const [naam, setNaam] = useState('');
  const [aantalMaanden, setAantalMaanden] = useState(3);
  const [klusjesTekst, setKlusjesTekst] = useState('');
  const [deadline, setDeadline] = useState('');

  function submit(e) {
    e.preventDefault();
    const klusjes = parseSpraakTekst(klusjesTekst);
    if (!naam.trim() || klusjes.length === 0) return;
    onToevoegen(naam.trim(), aantalMaanden, klusjes, deadline || null);
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
        <label className="ti-lbl" htmlFor="hhp-deadline">Deadline (optioneel)</label>
        <input id="hhp-deadline" type="date" className="ti-veld" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
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

function deadlineTekst(dagen) {
  if (dagen === null) return null;
  if (dagen > 0) return `Nog ${dagen} ${dagen === 1 ? 'dag' : 'dagen'} tot de deadline.`;
  if (dagen === 0) return 'Vandaag is de deadline.';
  const verstreken = Math.abs(dagen);
  return `Deadline was ${verstreken} ${verstreken === 1 ? 'dag' : 'dagen'} geleden.`;
}

// Gedebouncede, lokaal-bijgehouden uren-invoer. Zonder dit springt het
// bewerkte item bij ELKE losse klik/toetsaanslag naar een andere
// maand-groep: de LPT-maandverdeling (verdeelKlusjesOverMaanden) wordt live
// herberekend uit geschatteUren bij elke render (nodig voor de
// werktaken-koppeling, zie projectMaandOverzicht — kan niet zomaar op de
// bewaarde klusje.maand vertrouwen). Door de commit (onCommit, die
// uiteindelijk de herverdeling triggert) te debouncen i.p.v. bij elke klik
// meteen te schrijven, blijft het item op zijn plek staan terwijl je aan
// het plussen/typen bent — de herindeling settelt pas als je stopt.
const UREN_COMMIT_DEBOUNCE_MS = 500;

function UrenVeld({ waarde, stap, onCommit }) {
  const [lokaal, setLokaal] = useState(waarde);
  const timerRef = useRef(null);

  useEffect(() => { setLokaal(waarde); }, [waarde]);
  useEffect(() => () => clearTimeout(timerRef.current), []);

  function plan(nieuweWaarde) {
    const geklemd = Math.max(stap, nieuweWaarde);
    setLokaal(geklemd);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onCommit(geklemd), UREN_COMMIT_DEBOUNCE_MS);
  }

  return (
    <div className="hhp-uren-ctrl">
      <button type="button" className="wt-mini-btn" onClick={() => plan(lokaal - stap)}>−</button>
      <input
        type="number"
        className="hhp-uren-input"
        value={lokaal}
        min={stap}
        step={stap}
        onChange={(e) => plan(parseFloat(e.target.value) || stap)}
        aria-label="Geschatte uren"
      />
      <button type="button" className="wt-mini-btn" onClick={() => plan(lokaal + stap)}>+</button>
    </div>
  );
}

// Stapjes waarin een (extra groot) klusje verder opgeknipt kan worden — een
// los, derde niveau onder project -> klusje. Bewust 'Stappen' genoemd i.p.v.
// 'Subklusjes': die term is al in gebruik voor de klusjes van het project
// zelf (zie NieuwProjectForm hierboven), dit voorkomt naamsverwarring.
function StappenLijst({ projectId, klusjeId, stappen, onToevoegen, onToggle, onZetUren, onVerwijderen }) {
  const [tekst, setTekst] = useState('');

  function voegToe() {
    if (!tekst.trim()) return;
    onToevoegen(projectId, klusjeId, tekst.trim());
    setTekst('');
  }

  return (
    <div className="hhp-stappen">
      {stappen.map((s) => (
        <div className="hhp-stap-item" key={s.id}>
          <button className={`hh-check ${s.afgerond ? 'gedaan' : ''}`} onClick={() => onToggle(projectId, klusjeId, s.id)}>
            {s.afgerond ? '✓' : ''}
          </button>
          <span className={`hh-tekst ${s.afgerond ? 'gedaan' : ''}`}>{s.tekst}</span>
          <UrenVeld
            waarde={s.duurUren ?? 0.5}
            stap={0.25}
            onCommit={(w) => onZetUren(projectId, klusjeId, s.id, w)}
          />
          <button className="hh-verwijder" onClick={() => onVerwijderen(projectId, klusjeId, s.id)}>✕</button>
        </div>
      ))}
      <div className="hhp-stap-invoer">
        <input
          className="ti-veld"
          value={tekst}
          onChange={(e) => setTekst(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); voegToe(); } }}
          placeholder="Nieuwe stap..."
        />
        <button type="button" className="btn btn-g btn-sm" onClick={voegToe} disabled={!tekst.trim()}>+ Stap</button>
      </div>
      {stappen.length > 0 && (
        <p className="ti-hint hhp-stappen-hint">
          Totale duur van dit klusje ({stappen.reduce((som, s) => som + (s.duurUren ?? 0.5), 0)}u) volgt nu uit de stappen hierboven.
        </p>
      )}
    </div>
  );
}

// "Taak kan pas na" — dropdown met de andere klusjes van hetzelfde project.
// Geen cirkel-detectie (A vereist B, B vereist A) — bewust simpel, in het
// ergste geval krijgt geen van beide een Agenda-suggestie, wat de
// gebruiker zelf meteen kan herstellen door de vereiste weer los te koppelen.
function VereisteKiezer({ projectId, klusje, andereKlusjes, onZet }) {
  return (
    <div className="ti-veld-grp hhp-vereiste">
      <label className="ti-lbl">Taak kan pas na</label>
      <select
        className="ti-veld"
        value={klusje.vereistKlusjeId ?? ''}
        onChange={(e) => onZet(projectId, klusje.id, e.target.value || null)}
      >
        <option value="">— geen vereiste —</option>
        {andereKlusjes.map((k) => <option key={k.id} value={k.id}>{k.tekst}</option>)}
      </select>
    </div>
  );
}

function ProjectKaart({
  project, gekoppeldeWerktaken, onToggleKlusje, onZetUren, onVerwijderKlusje, onVerwijderProject, onZetDeadline,
  onToggleWerktaak, onOntkoppelWerktaak, onVoegStapToe, onToggleStap, onZetStapUren, onVerwijderStap,
  onZetVereiste, onVoegWerkvoorbereidingToe, onToggleWerkvoorbereiding, onVerwijderWerkvoorbereiding,
}) {
  const [uitgeklapt, setUitgeklapt] = useState(() => new Set());
  const [toonWerkvoorbereiding, setToonWerkvoorbereiding] = useState(false);

  const alleItems = [...project.klusjes, ...gekoppeldeWerktaken.map((t) => ({ afgerond: t.klaar }))];
  const afgerond = alleItems.filter((i) => i.afgerond).length;
  const totaal = alleItems.length;
  const pct = totaal ? Math.round((afgerond / totaal) * 100) : 0;
  const perMaand = projectMaandOverzicht(project.klusjes, gekoppeldeWerktaken, project.aantalMaanden, project.startMaand);
  const dagen = dagenTotDeadline(project.deadline, vandaagKey());

  function wisselUitgeklapt(id) {
    setUitgeklapt((huidig) => {
      const nieuw = new Set(huidig);
      if (nieuw.has(id)) nieuw.delete(id); else nieuw.add(id);
      return nieuw;
    });
  }

  return (
    <div className="card">
      <div className="hhp-kop">
        <div className="td-label">{project.naam}</div>
        <button
          type="button"
          className={`btn btn-sm ${toonWerkvoorbereiding ? 'btn-p' : 'btn-g'}`}
          onClick={() => setToonWerkvoorbereiding((w) => !w)}
        >
          🛠 Werkvoorbereiding
        </button>
        <button className="hh-verwijder" onClick={() => onVerwijderProject(project.id)}>✕</button>
      </div>

      {toonWerkvoorbereiding && (
        <WerkvoorbereidingLijst
          projectId={project.id}
          items={project.werkvoorbereiding ?? []}
          onToevoegen={onVoegWerkvoorbereidingToe}
          onToggle={onToggleWerkvoorbereiding}
          onVerwijderen={onVerwijderWerkvoorbereiding}
        />
      )}
      <div className="hhp-voortgang-track"><div className="hhp-voortgang-fill" style={{ width: `${pct}%` }} /></div>
      <div className="hhp-voortgang-lbl">{afgerond}/{totaal} klusjes ({pct}%)</div>

      <div className="hhp-deadline-rij">
        <input
          type="date"
          className="ti-veld hhp-deadline-input"
          value={project.deadline ?? ''}
          onChange={(e) => onZetDeadline(project.id, e.target.value || null)}
          aria-label="Deadline"
        />
        {dagen !== null && (
          <span className={`hhp-deadline-lbl ${dagen < 0 ? 'verlopen' : ''}`}>{deadlineTekst(dagen)}</span>
        )}
      </div>

      {perMaand.map(([maand, items]) => (
        <div key={maand} className="hhp-maand">
          <div className="hhp-maand-titel">{maandLabel(maand)}</div>
          <div className="hh-lijst">
            {items.map((item) => {
              const isWerk = item.bron === 'werk';
              const stappen = item.subklusjes ?? [];
              const isUitgeklapt = uitgeklapt.has(item.id);
              return (
                <div key={item.id}>
                  <div className="hh-item">
                    <button
                      className={`hh-check ${item.afgerond ? 'gedaan' : ''}`}
                      onClick={() => (isWerk ? onToggleWerktaak(item.id) : onToggleKlusje(project.id, item.id))}
                    >
                      {item.afgerond ? '✓' : ''}
                    </button>
                    <span className={`hh-tekst ${item.afgerond ? 'gedaan' : ''}`}>
                      {item.tekst}
                      {isWerk && <span className="hhp-werk-badge"> · werk</span>}
                      {!isWerk && isGeblokkeerd(item, project.klusjes) && (
                        <span
                          className="hhp-geblokkeerd"
                          title={`Wacht op: ${project.klusjes.find((k) => k.id === item.vereistKlusjeId)?.tekst ?? ''}`}
                        > ⛔</span>
                      )}
                    </span>
                    {isWerk || stappen.length > 0 ? (
                      <span className="hhp-uren-val" title={stappen.length > 0 ? 'Som van de duur van de stappen' : undefined}>
                        {item.geschatteUren}u
                      </span>
                    ) : (
                      <UrenVeld
                        waarde={item.geschatteUren}
                        stap={1}
                        onCommit={(w) => onZetUren(project.id, item.id, w)}
                      />
                    )}
                    {!isWerk && (
                      <button
                        type="button"
                        className="hhp-stappen-toggle"
                        onClick={() => wisselUitgeklapt(item.id)}
                        aria-label="Stappen tonen of verbergen"
                        title="In stappen opdelen"
                      >
                        {stappen.length > 0 ? `${stappen.filter((s) => s.afgerond).length}/${stappen.length}` : '+'}
                      </button>
                    )}
                    <button
                      className="hh-verwijder"
                      onClick={() => (isWerk ? onOntkoppelWerktaak(item.id) : onVerwijderKlusje(project.id, item.id))}
                      aria-label={isWerk ? 'Ontkoppel van project' : 'Verwijder klusje'}
                      title={isWerk ? 'Ontkoppel van project (taak blijft bestaan in Werktaken)' : undefined}
                    >✕</button>
                  </div>

                  {!isWerk && isUitgeklapt && (
                    <div className="hhp-details">
                      <VereisteKiezer
                        projectId={project.id}
                        klusje={item}
                        andereKlusjes={project.klusjes.filter((k) => k.id !== item.id)}
                        onZet={onZetVereiste}
                      />
                      <StappenLijst
                        projectId={project.id}
                        klusjeId={item.id}
                        stappen={stappen}
                        onToevoegen={onVoegStapToe}
                        onToggle={onToggleStap}
                        onZetUren={onZetStapUren}
                        onVerwijderen={onVerwijderStap}
                      />
                    </div>
                  )}
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

  function toevoegen(naam, aantalMaanden, klusjes, deadline) {
    projecten.voegProjectToe(naam, aantalMaanden, klusjes, deadline);
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
          onZetDeadline={projecten.zetDeadline}
          onToggleWerktaak={werkTaken.toggleKlaar}
          onOntkoppelWerktaak={(id) => werkTaken.zetProject(id, null)}
          onVoegStapToe={projecten.voegSubklusjeToe}
          onToggleStap={projecten.toggleSubklusje}
          onZetStapUren={projecten.zetStapUren}
          onVerwijderStap={projecten.verwijderSubklusje}
          onZetVereiste={projecten.zetVereistKlusje}
          onVoegWerkvoorbereidingToe={projecten.voegWerkvoorbereidingToe}
          onToggleWerkvoorbereiding={projecten.toggleWerkvoorbereiding}
          onVerwijderWerkvoorbereiding={projecten.verwijderWerkvoorbereiding}
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
