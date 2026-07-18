import { useState } from 'react';
import { EXTRA } from '../../lib/training/schema.js';
import './TrainingExtra.css';

const GROEPEN = {
  A: [['A-push', 'Borst & triceps (push)'], ['A-pull', 'Rug & biceps (pull)']],
  B: [['B-push', 'Schouders & triceps (push)'], ['B-pull', 'Posterieure keten (pull)']],
};

export default function TrainingExtra({ extraOefeningen }) {
  const [tab, setTab] = useState('A');

  return (
    <div>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Extra oefeningen</div>
      <p className="of-stap-tekst">Thuisuitvoerbaar — dumbbells of barbell, geen gymtoestellen vereist.</p>

      <div className="te-tabs">
        <button className={`te-tab ${tab === 'A' ? 'on' : ''}`} onClick={() => setTab('A')}>Training A</button>
        <button className={`te-tab ${tab === 'B' ? 'on' : ''}`} onClick={() => setTab('B')}>Training B</button>
      </div>

      {GROEPEN[tab].map(([key, titel]) => (
        <div className="card" key={key}>
          <div className="td-label">{titel}</div>
          {EXTRA[key].map((e) => (
            <div className="te-item" key={e.id}>
              <div>
                <div className="te-naam">{e.naam}</div>
                <div className="te-spier">{e.spier} · <span className="te-equip">{e.equip}</span></div>
              </div>
              <label className="te-switch">
                <input
                  type="checkbox"
                  checked={extraOefeningen.actief.includes(e.id)}
                  onChange={(ev) => extraOefeningen.toggle(e.id, ev.target.checked)}
                />
                <span className="te-switch-track" />
              </label>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
