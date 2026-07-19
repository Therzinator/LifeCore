import { KOMPAS_DOMEINEN } from '../../lib/act/kompas.js';
import './BullsEyeTarget.css';

const CENTRUM = 50;
const RINGEN = [45, 33.75, 22.5, 11.25];

// Afstand van het centrum voor een score 1-10 — score 10 (leef ik precies
// zoals ik zou willen) landt in de roos, score 1 (ver van hoe ik zou willen
// leven) op de buitenste ring.
function afstandVoorScore(score) {
  if (typeof score !== 'number') return null;
  return ((10 - score) / 9) * RINGEN[0];
}

function puntVoorDomein(domein, score) {
  const afstand = afstandVoorScore(score);
  if (afstand === null) return null;
  const rad = (domein.hoekGraden * Math.PI) / 180;
  return { x: CENTRUM + afstand * Math.cos(rad), y: CENTRUM + afstand * Math.sin(rad) };
}

// Eén gedeeld doel verdeeld in 4 kwadranten (i.p.v. 4 losse targets) — het
// klassieke ACT Bull's-Eye-format: elk kwadrant is een levensdomein, hoe
// dichter bij de roos hoe dichter je huidige gedrag bij die waarde staat.
export default function BullsEyeTarget({ scores }) {
  return (
    <svg viewBox="0 0 100 100" className="bet-svg" role="img" aria-label="Bull's-Eye waardenkompas">
      {RINGEN.map((r) => (
        <circle key={r} cx={CENTRUM} cy={CENTRUM} r={r} className="bet-ring" />
      ))}
      <line x1={5} y1={CENTRUM} x2={95} y2={CENTRUM} className="bet-as" />
      <line x1={CENTRUM} y1={5} x2={CENTRUM} y2={95} className="bet-as" />

      {KOMPAS_DOMEINEN.map((d) => {
        const punt = puntVoorDomein(d, scores?.[d.id]);
        const labelRad = (d.hoekGraden * Math.PI) / 180;
        const labelX = CENTRUM + 47 * Math.cos(labelRad);
        const labelY = CENTRUM + 47 * Math.sin(labelRad);
        return (
          <g key={d.id}>
            <text x={labelX} y={labelY} className="bet-label" textAnchor="middle">{d.labelKort}</text>
            {punt && <circle cx={punt.x} cy={punt.y} r="3" className="bet-dot" />}
          </g>
        );
      })}
    </svg>
  );
}
