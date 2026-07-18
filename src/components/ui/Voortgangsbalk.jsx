import './Voortgangsbalk.css';

export default function Voortgangsbalk({ stapIndex, totaal }) {
  const percentage = ((stapIndex + 1) / totaal) * 100;

  return (
    <div className="vb-wrap">
      <div className="vb-label">
        Stap {stapIndex + 1} van {totaal}
      </div>
      <div className="vb-balk-track">
        <div className="vb-balk" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
