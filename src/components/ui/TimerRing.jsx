import './TimerRing.css';

export default function TimerRing({ schaal, label, waarde, variant = 'accent' }) {
  const warn = variant === 'warn';

  return (
    <div className="tr-buiten">
      <div className={`tr-cirkel ${warn ? 'warn' : ''}`} style={{ transform: `scale(${schaal})` }}>
        <div className={`tr-label ${warn ? 'warn' : ''}`}>{label}</div>
        {waarde != null && <div className="tr-waarde">{waarde}</div>}
      </div>
    </div>
  );
}
