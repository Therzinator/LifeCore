import GeluidKiezer from '../ui/GeluidKiezer.jsx';
import { SLEEPTIMER_OPTIES } from './SessieSpeler.jsx';

export default function MindfulnessInstellingen({ instellingen, bewaar }) {
  const standaardDuur = instellingen.sleeptimerStandaardDuur ?? null;

  return (
    <div>
      <div className="card">
        <div className="td-label">Sleeptimer-standaardduur</div>
        <p className="ti-hint">Deze duur staat al aan bij het openen van een sessie — nog aan te passen tijdens het afspelen.</p>
        <div className="ti-rij">
          <button
            type="button"
            className={`btn btn-sm ${standaardDuur === null ? 'btn-p' : 'btn-g'}`}
            style={{ flex: 1 }}
            onClick={() => bewaar({ sleeptimerStandaardDuur: null })}
          >Uit</button>
          {SLEEPTIMER_OPTIES.map((min) => (
            <button
              key={min}
              type="button"
              className={`btn btn-sm ${standaardDuur === min ? 'btn-p' : 'btn-g'}`}
              style={{ flex: 1 }}
              onClick={() => bewaar({ sleeptimerStandaardDuur: min })}
            >{min} min</button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="td-label">Geluid</div>
        <GeluidKiezer
          label="Geluid bij einde ademhalingsoefening"
          waarde={instellingen.geluidFragment}
          onWaarde={(v) => bewaar({ geluidFragment: v })}
        />
      </div>
    </div>
  );
}
