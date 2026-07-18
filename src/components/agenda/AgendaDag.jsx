import { TYPE_ICOON, BLOK_TYPE_MODULE } from './agendaWeergave.js';

function datumLabel(datum) {
  return new Date(datum).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });
}

const DAGTYPE_OPTIES = [
  { waarde: null, label: 'Standaard' },
  { waarde: 'werkdag', label: 'Werkdag' },
  { waarde: 'vrij', label: 'Vrije dag' },
];

export default function AgendaDag({
  datum, blokInstanties, signalen, onVerwijderBlok, onNieuwBlok, dagTypeOverride, onZetDagTypeOverride, onNavigeer,
}) {
  const dagBlokken = blokInstanties.filter((b) => b.datum === datum).sort((a, b) => a.starttijd.localeCompare(b.starttijd));
  const dagSignalen = signalen.filter((s) => s.datum === datum);

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
              <button className="hh-verwijder" onClick={() => onVerwijderBlok(b.id)}>✕</button>
            </div>
          );
        })}
      </div>

      <button className="btn btn-g btn-full" style={{ marginTop: 'var(--space-sm)' }} onClick={onNieuwBlok}>+ Blok toevoegen</button>
    </div>
  );
}
