import './RustTimer.css';

export default function RustTimer({ timer }) {
  if (!timer.actief) return null;

  const minuten = Math.floor(timer.resterend / 60);
  const seconden = timer.resterend % 60;
  const pct = timer.totaal ? Math.round((timer.resterend / timer.totaal) * 100) : 0;

  return (
    <div className="rt-box" role="timer" aria-live="polite">
      <div className="rt-lbl">Rust · volgende set</div>
      <div className="rt-val">{minuten}:{seconden < 10 ? '0' : ''}{seconden}</div>
      <div className="rt-track"><div className="rt-fill" style={{ width: `${pct}%` }} /></div>
      <div className="rt-acts">
        <button className="btn btn-g btn-sm" onClick={timer.stop}>Stop</button>
        <button className="btn btn-g btn-sm" onClick={() => timer.plus(30)}>+30s</button>
      </div>
    </div>
  );
}
