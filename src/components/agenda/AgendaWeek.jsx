import { TYPE_ICOON } from './agendaWeergave.js';

function datumLabelKort(datum) {
  return new Date(datum).toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' });
}

export default function AgendaWeek({ datums, blokInstanties, signalen, onKiesDag }) {
  const vandaag = new Date().toISOString().slice(0, 10);

  return (
    <div className="ag-week-lijst">
      {datums.map((datum) => {
        const dagBlokken = blokInstanties.filter((b) => b.datum === datum);
        const dagSignalen = signalen.filter((s) => s.datum === datum);
        return (
          <button
            type="button"
            key={datum}
            className={`ag-week-dag ${datum === vandaag ? 'vandaag' : ''}`}
            onClick={() => onKiesDag(datum)}
          >
            <div className="ag-week-dag-kop">{datumLabelKort(datum)}</div>
            <div className="ag-week-dag-items">
              {dagSignalen.map((s) => <span key={s.id} className="ag-week-item">{TYPE_ICOON[s.type] ?? '•'} {s.tekst}</span>)}
              {dagBlokken.map((b) => <span key={`${b.id}-${b.datum}`} className="ag-week-item">{b.starttijd} {TYPE_ICOON[b.type] ?? '•'} {b.titel}</span>)}
              {dagBlokken.length === 0 && dagSignalen.length === 0 && <span className="ag-week-leeg">—</span>}
            </div>
          </button>
        );
      })}
    </div>
  );
}
