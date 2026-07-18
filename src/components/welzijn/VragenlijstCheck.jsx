import { useState } from 'react';
import OnderbouwingModal from '../ui/OnderbouwingModal.jsx';
import ResultaatWeergave from './ResultaatWeergave.jsx';
import { zachteTrend } from '../../lib/welzijn/trend.js';
import './VragenlijstCheck.css';

const OPTIES = ['Nooit', 'Soms', 'Vaak', 'Bijna altijd'];

export default function VragenlijstCheck({
  titel,
  subschalen,
  berekenScores,
  onderbouwingSleutel,
  geschiedenis,
  onKlaar,
}) {
  const [antwoorden, setAntwoorden] = useState({});
  const [fase, setFase] = useState('vragen');
  const [toonUitleg, setToonUitleg] = useState(false);

  function kies(sleutel, waarde) {
    setAntwoorden((huidig) => ({ ...huidig, [sleutel]: waarde }));
  }

  function verzend() {
    const scores = berekenScores(antwoorden);
    geschiedenis.voegToe(antwoorden, scores);
    setFase('resultaat');
  }

  if (fase === 'resultaat') {
    const resultaten = zachteTrend(
      geschiedenis.laatste?.scores ?? {},
      geschiedenis.vorige?.scores ?? null,
      subschalen,
    );
    return (
      <div>
        <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>{titel}</div>
        <ResultaatWeergave resultaten={resultaten} />
        <div className="of-acties">
          <button className="btn btn-p btn-full" onClick={onKlaar}>Terug naar overzicht</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>{titel}</div>
      <p className="of-stap-tekst vc-disclaimer">
        Dit is geen medisch instrument — een persoonlijk hulpmiddel om patronen bij jezelf op te
        merken, geïnspireerd op wetenschappelijke kaders.
      </p>
      <button className="ad-link" onClick={() => setToonUitleg(true)}>Waarom deze vragen?</button>

      {subschalen.map((sub) => (
        <div className="vc-subschaal" key={sub.id}>
          <div className="vc-subschaal-lbl">{sub.label}</div>
          {sub.items.map((tekst, i) => {
            const sleutel = `${sub.id}:${i}`;
            return (
              <div className="vc-vraag" key={sleutel}>
                <div className="vc-vraag-tekst">{tekst}</div>
                <div className="vc-opties">
                  {OPTIES.map((optie, waarde) => (
                    <button
                      key={optie}
                      className={`vc-optie ${antwoorden[sleutel] === waarde ? 'on' : ''}`}
                      onClick={() => kies(sleutel, waarde)}
                    >
                      {optie}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ))}

      <div className="of-acties">
        <button className="btn btn-text" onClick={onKlaar}>Annuleren</button>
        <button className="btn btn-p btn-full" onClick={verzend}>Bekijk resultaat</button>
      </div>

      {toonUitleg && <OnderbouwingModal sleutel={onderbouwingSleutel} onClose={() => setToonUitleg(false)} />}
    </div>
  );
}
