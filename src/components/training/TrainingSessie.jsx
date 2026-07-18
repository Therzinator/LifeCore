import { berekenOpbouwsets } from '../../lib/training/opbouw.js';
import { volgendeGewicht, isNieuwePR } from '../../lib/training/progressie.js';
import SchijvenWeergave from './SchijvenWeergave.jsx';
import './TrainingSessie.css';

export default function TrainingSessie({ training, setOefeningen, setGewicht, geschiedenis, onAfgerond }) {
  const { oefeningen } = training;

  function pasGewicht(oefIndex, delta) {
    const nieuw = oefeningen.map((oef, i) =>
      i === oefIndex ? { ...oef, gewicht: Math.max(0, oef.gewicht + delta) } : oef,
    );
    setOefeningen(nieuw);
  }

  function vinkSet(oefIndex, setIndex) {
    const nieuw = oefeningen.map((oef, i) => {
      if (i !== oefIndex) return oef;
      const afgevinkt = oef.afgevinkt.map((v, si) => (si === setIndex ? !v : v));
      return { ...oef, afgevinkt };
    });
    setOefeningen(nieuw);
  }

  function afronden() {
    const record = {
      datum: new Date().toISOString(),
      letter: training.letter,
      oefeningen: oefeningen.map((oef) => ({
        id: oef.id,
        naam: oef.naam,
        gewicht: oef.gewicht,
        setsGedaan: oef.afgevinkt.filter(Boolean).length,
        setsTotaal: oef.sets,
      })),
    };
    geschiedenis.voegToe(record);

    oefeningen.forEach((oef) => {
      if (oef.afgevinkt.every(Boolean)) {
        setGewicht(oef.id, volgendeGewicht(oef.gewicht, oef.id));
      }
    });

    onAfgerond();
  }

  return (
    <div>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>
        Training {training.letter}
      </div>

      {oefeningen.map((oef, oefIndex) => {
        const opbouw = berekenOpbouwsets(oef.gewicht, oef.stangType, 2.5);
        const isPR = isNieuwePR(oef.id, oef.gewicht, geschiedenis.sessies);

        return (
          <div className="ts-oefening" key={oef.id}>
            <div className="ts-oefening-kop">
              <div className="ts-oefening-naam">
                {oef.naam}
                {isPR && <span className="ts-pr">PR</span>}
              </div>
              <div className="ts-oefening-spier">{oef.spier}</div>
            </div>

            <div className="ts-gewicht-kies">
              <button className="btn btn-g btn-sm" onClick={() => pasGewicht(oefIndex, -2.5)}>−2.5</button>
              <div className="ts-gewicht-waarde">{oef.gewicht} kg</div>
              <button className="btn btn-g btn-sm" onClick={() => pasGewicht(oefIndex, 2.5)}>+2.5</button>
            </div>

            {opbouw.length > 0 && (
              <div className="ts-opbouw">
                <div className="ts-opbouw-lbl">Opbouwsets</div>
                {opbouw.map((set, i) => (
                  <div className="ts-opbouw-set" key={i}>
                    {set.label}: {set.gewicht} kg × {set.reps}
                  </div>
                ))}
              </div>
            )}

            <SchijvenWeergave totaalGewicht={oef.gewicht} stangType={oef.stangType} />

            <div className="ts-sets">
              {oef.afgevinkt.map((gedaan, setIndex) => (
                <button
                  key={setIndex}
                  className={`ts-set-check ${gedaan ? 'gedaan' : ''}`}
                  onClick={() => vinkSet(oefIndex, setIndex)}
                >
                  Set {setIndex + 1} · {oef.reps} reps
                </button>
              ))}
            </div>
          </div>
        );
      })}

      <div className="of-acties">
        <button className="btn btn-p btn-full" onClick={afronden}>Training afronden</button>
      </div>
    </div>
  );
}
