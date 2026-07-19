import { useState } from 'react';
import './BewerkbareTekst.css';

// Klik op de tekst om 'm te bewerken; Enter of wegklikken (blur) bewaart,
// Escape annuleert. Generiek en domeinloos — voor elke naam die achteraf
// aanpasbaar moet zijn zonder een apart formulier/modal te openen (bv.
// klusjes en boodschappen-items op de Thuis-tab).
export default function BewerkbareTekst({ waarde, onWijzig, className, label }) {
  const [bewerken, setBewerken] = useState(false);
  const [lokaal, setLokaal] = useState(waarde);

  function beginBewerken() {
    setLokaal(waarde);
    setBewerken(true);
  }

  function bewaar() {
    setBewerken(false);
    const nieuw = lokaal.trim();
    if (nieuw && nieuw !== waarde) onWijzig(nieuw);
  }

  function toetsAf(e) {
    if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); }
    if (e.key === 'Escape') { setLokaal(waarde); setBewerken(false); }
  }

  if (bewerken) {
    return (
      <input
        className={`bt-invoer ${className ?? ''}`}
        value={lokaal}
        onChange={(e) => setLokaal(e.target.value)}
        onBlur={bewaar}
        onKeyDown={toetsAf}
        autoFocus
        onFocus={(e) => e.target.select()}
        aria-label={label}
      />
    );
  }

  return (
    <button type="button" className={`bt-tekst ${className ?? ''}`} onClick={beginBewerken} title="Klik om te bewerken">
      {waarde}
    </button>
  );
}
