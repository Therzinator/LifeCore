import './ResultaatWeergave.css';

export default function ResultaatWeergave({ resultaten }) {
  return (
    <div className="rw-lijst">
      {resultaten.map((r) => (
        <div className="rw-item" key={r.id}>
          <div className="rw-label">{r.label}</div>
          <div className="rw-momentopname">{r.momentopname}</div>
          {r.trend && <div className="rw-trend">{r.trend}</div>}
        </div>
      ))}
    </div>
  );
}
