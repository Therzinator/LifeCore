import { TYPE_ICOON, BLOK_TYPE_MODULE } from './agendaWeergave.js';

function datumLabel(datum) {
  return new Date(datum).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });
}

const DAGTYPE_OPTIES = [
  { waarde: null, label: 'Standaard' },
  { waarde: 'werkdag', label: 'Werkdag' },
  { waarde: 'vrij', label: 'Vrije dag' },
  { waarde: 'klusjesdag', label: 'Klusjes-dag' },
];

export default function AgendaDag({
  datum, blokInstanties, signalen, onVerwijderBlok, onBewerkBlok, onNieuwBlok, dagTypeOverride, onZetDagTypeOverride, onNavigeer,
  openKlusjes = [], onVoegKlusjeToe, onVoegTrainingToe,
  openHuishoudTaken = [], onVoegHuishoudTaakToe,
  toonMeditatieSuggestie = false, onVoegMeditatieToe,
}) {
  const dagBlokken = blokInstanties.filter((b) => b.datum === datum).sort((a, b) => a.starttijd.localeCompare(b.starttijd));
  const dagSignalen = signalen.filter((s) => s.datum === datum);
  const isKlusjesDag = dagSignalen.some((s) => s.type === 'klusjesdag');
  // Al ingepland (bronId, zie AgendaPagina) -> niet nog een keer voorstellen
  // op dezelfde dag.
  const trainingSignaal = dagSignalen
    .find((s) => (s.type === 'lift' || s.type === 'cardio') && !dagBlokken.some((b) => b.bronId === s.id));

  return (
    <div>
      <div className="td-label" style={{ textTransform: 'capitalize' }}>{datumLabel(datum)}</div>

      <div className="ti-veld-grp" style={{ marginBottom: 'var(--space-sm)' }}>
        <label className="ti-lbl">Werkdag of vrije dag</label>
        <div className="ti-rij">
          {DAGTYPE_OPTIES.map((optie) => (
            <button
              key={optie.label}
              type="button"
              className={`btn btn-sm ${(dagTypeOverride ?? null) === optie.waarde ? 'btn-p' : 'btn-g'}`}
              style={{ flex: 1 }}
              onClick={() => onZetDagTypeOverride(datum, optie.waarde)}
            >{optie.label}</button>
          ))}
        </div>
        <p className="ti-hint">Overschrijft alleen deze dag — het wekelijkse werkdagen-patroon (Werk-instellingen) blijft ongewijzigd.</p>
      </div>

      {dagSignalen.length > 0 && (
        <div className="ag-signalen-rij">
          {dagSignalen.map((s) => (
            <span key={s.id} className="ag-signaal-chip">{TYPE_ICOON[s.type] ?? '•'} {s.tekst}</span>
          ))}
        </div>
      )}

      {toonMeditatieSuggestie && onVoegMeditatieToe && (
        <div className="ag-suggesties">
          <div className="ti-lbl">Moment voor jezelf</div>
          <p className="ti-hint">Nog geen rustmoment gepland vandaag — een korte meditatie kan helpen bij piekeren.</p>
          <div className="hh-lijst">
            <div className="hh-item">
              <span className="hh-tekst">🧘 Mediteren</span>
              <button className="btn btn-g btn-sm" onClick={onVoegMeditatieToe}>+ Toevoegen</button>
            </div>
          </div>
        </div>
      )}

      {trainingSignaal && onVoegTrainingToe && (
        <div className="ag-suggesties">
          <div className="ti-lbl">{trainingSignaal.tekst} — wanneer inplannen?</div>
          <p className="ti-hint">Het liefst in de ochtend, kort na het ontbijt — lukt dat niet, dan later op de dag.</p>
          <div className="ti-rij">
            {trainingSignaal.tijdOpties.map((optie) => (
              <button
                key={optie.label}
                type="button"
                className="btn btn-g btn-sm"
                style={{ flex: 1 }}
                onClick={() => onVoegTrainingToe(trainingSignaal, optie.starttijd)}
              >{optie.label} · {optie.starttijd}</button>
            ))}
          </div>
        </div>
      )}

      {isKlusjesDag && openKlusjes.length > 0 && (
        <div className="ag-suggesties">
          <div className="ti-lbl">Suggesties uit Kluslijst</div>
          <p className="ti-hint">Grotere klusjes staan bovenaan — ideaal om vandaag een flinke stap te zetten.</p>
          <div className="hh-lijst">
            {openKlusjes.map((k) => (
              <div className="hh-item" key={k.id}>
                <span className="hh-tekst">{k.projectNaam}: {k.tekst}</span>
                <span className="hhp-uren-val">{k.geschatteUren}u</span>
                <button className="btn btn-g btn-sm" onClick={() => onVoegKlusjeToe(k)}>+ Toevoegen</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {openHuishoudTaken.length > 0 && (
        <div className="ag-suggesties">
          <div className="ti-lbl">Huishouden vandaag</div>
          <p className="ti-hint">Uit het weekschema — plan een moment in of vink &apos;m af bij Thuis → Huishouden.</p>
          <div className="hh-lijst">
            {openHuishoudTaken.map((t) => (
              <div className="hh-item" key={t.id}>
                <span className="hh-tekst">🧹 {t.tekst}</span>
                <button className="btn btn-g btn-sm" onClick={() => onVoegHuishoudTaakToe(t)}>+ Toevoegen</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="hh-lijst">
        {dagBlokken.length === 0 && <p className="of-stap-tekst">Nog niets gepland.</p>}
        {dagBlokken.map((b) => {
          const moduleVoorBlok = BLOK_TYPE_MODULE[b.type];
          return (
            <div className="hh-item" key={`${b.id}-${b.datum}`}>
              <span className="ag-item-tijd">{b.starttijd}–{b.eindtijd}</span>
              <span className="hh-tekst">{TYPE_ICOON[b.type] ?? '•'} {b.titel}</span>
              {moduleVoorBlok && onNavigeer && (
                <button className="btn btn-g btn-sm" onClick={() => onNavigeer(moduleVoorBlok)}>Start sessie →</button>
              )}
              {onBewerkBlok && (
                <button className="btn btn-g btn-sm" onClick={() => onBewerkBlok(b)} aria-label="Blok bewerken">✏️</button>
              )}
              <button className="hh-verwijder" onClick={() => onVerwijderBlok(b.id)}>✕</button>
            </div>
          );
        })}
      </div>

      <button className="btn btn-g btn-full" style={{ marginTop: 'var(--space-sm)' }} onClick={onNieuwBlok}>+ Blok toevoegen</button>
    </div>
  );
}
