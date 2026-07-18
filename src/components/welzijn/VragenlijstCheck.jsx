import { useState } from 'react';
import OnderbouwingModal from '../ui/OnderbouwingModal.jsx';
import './VragenlijstCheck.css';

const OPTIES = ['Nooit', 'Soms', 'Vaak', 'Bijna altijd'];
const SECTIE_LABEL = { burnout: 'Burn-out', herstel: 'Herstel' };

export default function VragenlijstCheck({ titel, subschalen, onderbouwingSleutel, onVerzenden, onAnnuleren }) {
  const [antwoorden, setAntwoorden] = useState({});
  const [toonUitleg, setToonUitleg] = useState(false);

  function kies(sleutel, waarde) {
    setAntwoorden((huidig) => ({ ...huidig, [sleutel]: waarde }));
  }

  const totaalItems = subschalen.reduce((n, sub) => n + sub.items.length, 0);
  const beantwoord = Object.keys(antwoorden).length;

  let laatsteSectie = null;

  return (
    <div>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>{titel}</div>
      <p className="of-stap-tekst vc-disclaimer">
        Dit is geen medisch instrument — een persoonlijk hulpmiddel om patronen bij jezelf op te
        merken, geïnspireerd op wetenschappelijke kaders.
      </p>
      <button className="ad-link" onClick={() => setToonUitleg(true)}>Waarom deze vragen?</button>

      {subschalen.map((sub) => {
        const nieuweSectie = sub.sectie !== laatsteSectie;
        laatsteSectie = sub.sectie;
        return (
          <div key={sub.id}>
            {nieuweSectie && SECTIE_LABEL[sub.sectie] && (
              <div className="vc-sectie-titel">{SECTIE_LABEL[sub.sectie]}</div>
            )}
            <div className="vc-subschaal">
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
          </div>
        );
      })}

      <div className="of-acties">
        <button className="btn btn-text" onClick={onAnnuleren}>Annuleren</button>
        <button
          className="btn btn-p btn-full"
          onClick={() => onVerzenden(antwoorden)}
          disabled={beantwoord < totaalItems}
        >
          Versturen ({beantwoord}/{totaalItems})
        </button>
      </div>

      {toonUitleg && <OnderbouwingModal sleutel={onderbouwingSleutel} onClose={() => setToonUitleg(false)} />}
    </div>
  );
}
