import { useMemo, useState } from 'react';
import './LijnGrafiek.css';

const BREEDTE = 320;
const HOOGTE = 120;
const PAD = 12;

// Enkele-serie lijngrafiek (geen legenda nodig — de titel van de kaart zegt
// al wat er getoond wordt). Kruisdraad + tooltip bij hover, een optionele
// annotatie-lijn (bijv. programma-overgang) apart van de databron zelf.
export default function LijnGrafiek({ labels, waarden, eenheid = '', annotatieIndex = null, annotatieLabel = '' }) {
  const [hoverIndex, setHoverIndex] = useState(null);

  const punten = useMemo(() => {
    if (waarden.length === 0) return [];
    const max = Math.max(...waarden, 1) * 1.1;
    const stapX = waarden.length > 1 ? (BREEDTE - PAD * 2) / (waarden.length - 1) : 0;
    return waarden.map((w, i) => ({
      x: PAD + i * stapX,
      y: HOOGTE - PAD - (w / max) * (HOOGTE - PAD * 2),
      waarde: w,
      label: labels[i],
    }));
  }, [waarden, labels]);

  if (waarden.length === 0) {
    return <p className="of-stap-tekst">Nog geen data.</p>;
  }

  const basislijnY = HOOGTE - PAD;
  const lijnPad = punten.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  function onPointerMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * BREEDTE;
    let dichtsteIndex = 0;
    let kleinsteAfstand = Infinity;
    punten.forEach((p, i) => {
      const afstand = Math.abs(p.x - relX);
      if (afstand < kleinsteAfstand) { kleinsteAfstand = afstand; dichtsteIndex = i; }
    });
    setHoverIndex(dichtsteIndex);
  }

  const laatstePunt = punten[punten.length - 1];
  const hoverPunt = hoverIndex != null ? punten[hoverIndex] : laatstePunt;
  const annotatiePunt = annotatieIndex != null ? punten[annotatieIndex] : null;

  return (
    <div className="lg-wrap">
      <svg
        viewBox={`0 0 ${BREEDTE} ${HOOGTE}`}
        className="lg-svg"
        onPointerMove={onPointerMove}
        onPointerLeave={() => setHoverIndex(null)}
        role="img"
        aria-label={`Lijngrafiek, laatste waarde ${laatstePunt.waarde}${eenheid}`}
      >
        <line x1={PAD} y1={basislijnY} x2={BREEDTE - PAD} y2={basislijnY} className="lg-baseline" />

        {annotatiePunt && (
          <>
            <line x1={annotatiePunt.x} y1={PAD} x2={annotatiePunt.x} y2={basislijnY} className="lg-annotatie-lijn" />
            <text x={annotatiePunt.x} y={PAD - 3} className="lg-annotatie-label" textAnchor="middle">{annotatieLabel}</text>
          </>
        )}

        {hoverIndex != null && (
          <line x1={hoverPunt.x} y1={PAD} x2={hoverPunt.x} y2={basislijnY} className="lg-crosshair" />
        )}

        <polyline points={lijnPad} className="lg-lijn" fill="none" />

        <circle cx={laatstePunt.x} cy={laatstePunt.y} r="5" className="lg-eind-ring" />
        <circle cx={laatstePunt.x} cy={laatstePunt.y} r="4" className="lg-eind-dot" />

        {hoverIndex != null && <circle cx={hoverPunt.x} cy={hoverPunt.y} r="4" className="lg-hover-dot" />}
      </svg>

      <div className="lg-tooltip">
        <strong>{hoverPunt.waarde}{eenheid}</strong> <span>{hoverPunt.label}</span>
      </div>
    </div>
  );
}
