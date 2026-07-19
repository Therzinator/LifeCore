import './TimerRing.css';

// voortgangPct (optioneel, 0-100): vult de buitenring als een taartpunt-
// achtige voortgangsindicator (conic-gradient) — voor sessies met een vaste
// duur (bv. de gekozen 3/5/10-min ademmeditatie), zodat je in één oogopslag
// ziet hoe ver je door de hele sessie bent, los van de per-fase-animatie
// van de binnenste cirkel. Zonder deze prop blijft de buitenring een simpele
// rand, zoals bij de overige TimerRing-toepassingen (plank-timer e.d.).
export default function TimerRing({ schaal, label, waarde, variant = 'accent', voortgangPct = null }) {
  const warn = variant === 'warn';
  const buitenStijl = voortgangPct != null
    ? { '--tr-voortgang': `${Math.min(100, Math.max(0, voortgangPct))}%` }
    : undefined;

  return (
    <div className={`tr-buiten ${voortgangPct != null ? 'met-voortgang' : ''}`} style={buitenStijl}>
      <div className={`tr-cirkel ${warn ? 'warn' : ''}`} style={{ transform: `scale(${schaal})` }}>
        <div className={`tr-label ${warn ? 'warn' : ''}`}>{label}</div>
        {waarde != null && <div className="tr-waarde">{waarde}</div>}
      </div>
    </div>
  );
}
