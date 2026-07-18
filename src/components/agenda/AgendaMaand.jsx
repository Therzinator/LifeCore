import { maandRooster } from '../../lib/agenda/kalenderRooster.js';
import { datumKey } from '../../utils/datum.js';

const DAG_KOPPEN = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];

export default function AgendaMaand({ jaar, maand, blokInstanties, signalen, onKiesDag }) {
  const weken = maandRooster(jaar, maand);
  const vandaag = datumKey();

  return (
    <div className="ag-maand-grid">
      <div className="ag-maand-week ag-maand-koppen">
        {DAG_KOPPEN.map((l) => <div key={l} className="ag-maand-kop">{l}</div>)}
      </div>
      {weken.map((week) => (
        <div className="ag-maand-week" key={week[0].datum}>
          {week.map((dag) => {
            const dagBlokken = blokInstanties.filter((b) => b.datum === dag.datum);
            const dagSignalen = signalen.filter((s) => s.datum === dag.datum);
            const stippen = [...dagSignalen, ...dagBlokken].slice(0, 4);
            return (
              <button
                type="button"
                key={dag.datum}
                className={`ag-maand-dag ${dag.inMaand ? '' : 'buiten'} ${dag.datum === vandaag ? 'vandaag' : ''}`}
                onClick={() => onKiesDag(dag.datum)}
              >
                <div className="ag-maand-daggetal">{Number(dag.datum.slice(-2))}</div>
                <div className="ag-maand-stippen">
                  {stippen.map((item) => <span key={item.id} className={`ag-stip ${item.type}`} />)}
                </div>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
