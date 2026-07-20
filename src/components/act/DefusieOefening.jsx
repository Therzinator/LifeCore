import { useEffect, useState } from 'react';
import { defusieStappen, DEFUSIE_TECHNIEKEN } from '../../lib/act/defusie.js';
import OnderbouwingModal from '../ui/OnderbouwingModal.jsx';
import SpraakKnop from '../ui/SpraakKnop.jsx';
import './DefusieOefening.css';

export default function DefusieOefening({ voorgeladenGedachte, onGeconsumeerd }) {
  const [gedachte, setGedachte] = useState(() => voorgeladenGedachte ?? '');

  useEffect(() => {
    if (voorgeladenGedachte) onGeconsumeerd?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- alleen bij mount: seed vanuit de ochtend-braindump is eenmalig, latere invoer loopt via lokale state.
  }, []);
  const [techniek, setTechniek] = useState(DEFUSIE_TECHNIEKEN[0].id);
  const [stappen, setStappen] = useState([]);
  const [stapIndex, setStapIndex] = useState(0);
  const [toonUitleg, setToonUitleg] = useState(false);

  function begin() {
    const berekend = defusieStappen(gedachte, techniek);
    if (berekend.length === 0) return;
    setStappen(berekend);
    setStapIndex(0);
  }

  function opnieuw() {
    setStappen([]);
    setGedachte('');
  }

  return (
    <div>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>
        Even afstand nemen
      </div>
      <p className="of-stap-tekst">
        Schrijf een gedachte op die veel ruimte inneemt. We bekijken hem samen van een stapje afstand.
      </p>

      <button className="ad-link" onClick={() => setToonUitleg(true)}>Waarom werkt dit?</button>

      {stappen.length === 0 && (
        <>
          <div className="do-techniek-rij">
            {DEFUSIE_TECHNIEKEN.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`btn btn-sm ${techniek === t.id ? 'btn-p' : 'btn-g'}`}
                onClick={() => setTechniek(t.id)}
              >{t.label}</button>
            ))}
          </div>
          <p className="ti-hint">{DEFUSIE_TECHNIEKEN.find((t) => t.id === techniek)?.omschrijving}</p>

          <div className="sk-inline-rij">
            <textarea
              className="do-input"
              value={gedachte}
              onChange={(e) => setGedachte(e.target.value)}
              placeholder="Bijvoorbeeld: ik ga dit niet redden..."
            />
            <SpraakKnop waarde={gedachte} onWaarde={setGedachte} />
          </div>
          <button className="btn btn-p btn-full" onClick={begin} disabled={!gedachte.trim()}>
            Bekijk het van een afstand
          </button>
        </>
      )}

      {stappen.length > 0 && (
        <>
          <div className="do-stappen">
            {stappen.slice(0, stapIndex + 1).map((stap, i) => (
              <div className="do-stap" key={i}>
                <div className="do-stap-lbl">{stap.label}</div>
                <div className="do-stap-tekst">{stap.tekst}</div>
              </div>
            ))}
          </div>

          <p className="do-onrust-notitie">
            Voelt dit onrustiger in plaats van rustiger? Dat gebeurt bij sommige mensen — stop er dan gerust mee.
          </p>

          <div className="of-acties">
            {stapIndex < stappen.length - 1 && (
              <button className="btn btn-p btn-full" onClick={() => setStapIndex((i) => i + 1)}>
                Nog een stap terug
              </button>
            )}
            {stapIndex === stappen.length - 1 && (
              <button className="btn btn-g btn-full" onClick={opnieuw}>
                Opnieuw
              </button>
            )}
          </div>
        </>
      )}

      {toonUitleg && <OnderbouwingModal sleutel="defusieACT" onClose={() => setToonUitleg(false)} />}
    </div>
  );
}
