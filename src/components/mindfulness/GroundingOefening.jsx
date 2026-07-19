import { useEffect, useState } from 'react';
import { GROUNDING_VRAGEN } from '../../lib/mindfulness/grounding.js';
import { useSpraakVoorlezer } from '../../hooks/useSpraakVoorlezer.js';
import OnderbouwingModal from '../ui/OnderbouwingModal.jsx';
import HandsFreeKnop from '../ui/HandsFreeKnop.jsx';
import './GroundingOefening.css';

const PAUZE_TUSSEN_VRAGEN_MS = 2500;

export default function GroundingOefening({ toonToast, onKlaar }) {
  const [actief, setActief] = useState(null);
  const [toonUitleg, setToonUitleg] = useState(false);
  const [handsFree, setHandsFree] = useState(false);
  const [hfIndex, setHfIndex] = useState(0);
  const spraak = useSpraakVoorlezer();

  // Hands-free: spreekt elke vraag+hint uit en gaat vanzelf door naar de
  // volgende, zonder dat er getikt hoeft te worden. `geannuleerd` voorkomt
  // dat een al lopende spraak/pauze na het uitzetten van hands-free (of een
  // snelle her-toggle) alsnog de volgende stap start.
  useEffect(() => {
    if (!handsFree) return undefined;

    if (hfIndex >= GROUNDING_VRAGEN.length) {
      spraak.spreek('Klaar. Neem nog even de tijd om hier te zijn.');
      setHandsFree(false);
      setActief(null);
      return undefined;
    }

    let geannuleerd = false;
    let vervolgTimer = null;
    const vraag = GROUNDING_VRAGEN[hfIndex];
    setActief(vraag.num);
    spraak.spreek(`${vraag.vraag}. ${vraag.hint}`, {
      onEinde: () => {
        if (geannuleerd) return;
        vervolgTimer = setTimeout(() => { if (!geannuleerd) setHfIndex((i) => i + 1); }, PAUZE_TUSSEN_VRAGEN_MS);
      },
    });

    return () => {
      geannuleerd = true;
      clearTimeout(vervolgTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- alleen bij hands-free-toggle of stap-overgang opnieuw uitspreken.
  }, [handsFree, hfIndex]);

  function toggleHandsFree() {
    if (handsFree) {
      spraak.stop();
      setHandsFree(false);
    } else {
      setHfIndex(0);
      setHandsFree(true);
    }
  }

  function klaar() {
    spraak.stop();
    toonToast?.('Grounding afgerond — je bent hier 🌿', 'ok');
    onKlaar();
  }

  return (
    <div>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>5-4-3-2-1 Grounding</div>
      <p className="of-stap-tekst">
        Kijk om je heen en beantwoord elke vraag. Geen goede of foute antwoorden. Neem de tijd.
      </p>

      <div className="sk-inline-rij">
        <button className="ad-link" onClick={() => setToonUitleg(true)}>Waarom werkt dit?</button>
        <HandsFreeKnop actief={handsFree} onToggle={toggleHandsFree} beschikbaar={spraak.beschikbaar} />
      </div>

      <div className="go-lijst">
        {GROUNDING_VRAGEN.map((v) => (
          <button
            key={v.num}
            className={`go-kaart ${actief === v.num ? 'actief' : ''}`}
            onClick={() => { if (!handsFree) setActief(actief === v.num ? null : v.num); }}
          >
            <div className="go-num">{v.num}</div>
            <div className="go-vraag">{v.vraag}</div>
            <div className="go-hint">{v.hint}</div>
          </button>
        ))}
      </div>

      <div className="of-acties">
        <button className="btn btn-text" onClick={() => { spraak.stop(); onKlaar(); }}>Terug</button>
        <button className="btn btn-p btn-full" onClick={klaar}>Klaar — ik voel me verankerd</button>
      </div>

      {toonUitleg && <OnderbouwingModal sleutel="grounding54321" onClose={() => setToonUitleg(false)} />}
    </div>
  );
}
