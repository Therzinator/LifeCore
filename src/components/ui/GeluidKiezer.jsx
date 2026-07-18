import { useId } from 'react';
import { GELUIDSFRAGMENTEN, speelFragment } from '../../lib/geluid/fragmenten.js';
import './GeluidKiezer.css';

export default function GeluidKiezer({ label, waarde, onWaarde }) {
  const veldId = useId();

  return (
    <div className="gk-veld-grp">
      <label className="gk-lbl" htmlFor={veldId}>{label}</label>
      <div className="gk-rij">
        <select id={veldId} className="gk-select" value={waarde} onChange={(e) => onWaarde(e.target.value)}>
          {GELUIDSFRAGMENTEN.map((f) => (
            <option key={f.id} value={f.id}>{f.naam}</option>
          ))}
        </select>
        <button type="button" className="gk-test-btn" onClick={() => speelFragment(waarde)}>▶ Test</button>
      </div>
    </div>
  );
}
