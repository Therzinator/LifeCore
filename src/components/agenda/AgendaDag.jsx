import { TYPE_ICOON } from './agendaWeergave.js';

function datumLabel(datum) {
  return new Date(datum).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function AgendaDag({ datum, blokInstanties, signalen, onVerwijderBlok, onNieuwBlok }) {
  const dagBlokken = blokInstanties.filter((b) => b.datum === datum).sort((a, b) => a.starttijd.localeCompare(b.starttijd));
  const dagSignalen = signalen.filter((s) => s.datum === datum);

  return (
    <div>
      <div className="td-label" style={{ textTransform: 'capitalize' }}>{datumLabel(datum)}</div>

      {dagSignalen.length > 0 && (
        <div className="ag-signalen-rij">
          {dagSignalen.map((s) => (
            <span key={s.id} className="ag-signaal-chip">{TYPE_ICOON[s.type] ?? '•'} {s.tekst}</span>
          ))}
        </div>
      )}

      <div className="hh-lijst">
        {dagBlokken.length === 0 && <p className="of-stap-tekst">Nog niets gepland.</p>}
        {dagBlokken.map((b) => (
          <div className="hh-item" key={`${b.id}-${b.datum}`}>
            <span className="ag-item-tijd">{b.starttijd}–{b.eindtijd}</span>
            <span className="hh-tekst">{TYPE_ICOON[b.type] ?? '•'} {b.titel}</span>
            <button className="hh-verwijder" onClick={() => onVerwijderBlok(b.id)}>✕</button>
          </div>
        ))}
      </div>

      <button className="btn btn-g btn-full" style={{ marginTop: 'var(--space-sm)' }} onClick={onNieuwBlok}>+ Blok toevoegen</button>
    </div>
  );
}
