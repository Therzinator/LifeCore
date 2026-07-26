import { useEffect, useRef, useState } from 'react';
import { berekenGecommitteerdeWaarde } from '../../utils/getalVeld.js';

// Vervangt een kaal <input type="number"> met value={x} onChange={parse-en-
// clamp-bij-elke-toets} — dat klassieke patroon maakt het onmogelijk om het
// veld leeg te maken (elke lege tussenstand wordt meteen teruggezet naar de
// fallback vóórdat je een nieuw getal kunt intypen). Dit veld houdt tijdens
// het typen een vrije, ongevalideerde tekststring bij (geen enkele parse/
// clamp, ook geen ondergrens) en committeert pas bij onBlur — dat is ook het
// natuurlijke moment om 'op te slaan', niet elke toetsaanslag.
export default function GetalVeld({
  value, onCommit, min, max, step, fallback = 0, geheel = true, className, id, style, placeholder, ...rest
}) {
  const [tekst, setTekst] = useState(value == null ? '' : String(value));
  const gefocust = useRef(false);

  useEffect(() => {
    if (!gefocust.current) setTekst(value == null ? '' : String(value));
  }, [value]);

  function commit() {
    gefocust.current = false;
    const definitief = berekenGecommitteerdeWaarde(tekst, { min, max, fallback, geheel });
    setTekst(String(definitief));
    if (definitief !== value) onCommit(definitief);
  }

  return (
    <input
      id={id}
      type="number"
      className={className}
      style={style}
      min={min}
      max={max}
      step={step}
      placeholder={placeholder}
      value={tekst}
      onFocus={() => { gefocust.current = true; }}
      onChange={(e) => setTekst(e.target.value)}
      onBlur={commit}
      {...rest}
    />
  );
}
