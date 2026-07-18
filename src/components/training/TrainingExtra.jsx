import { useState } from 'react';
import { EXTRA } from '../../lib/training/schema.js';
import { SPANNING_OEFENINGEN, extraOefeningMetAfbeelding } from '../../lib/oefeningen/vrijeOefeningenDb.js';
import OefeningPopup from '../ui/OefeningPopup.jsx';
import Modal from '../ui/Modal.jsx';
import OefeningDetail from '../ui/OefeningDetail.jsx';
import './TrainingExtra.css';

const GROEPEN = {
  A: [['A-push', 'Borst & triceps (push)'], ['A-pull', 'Rug & biceps (pull)']],
  B: [['B-push', 'Schouders & triceps (push)'], ['B-pull', 'Posterieure keten (pull)']],
};

const ALLE_EXTRA = Object.values(EXTRA).flat();

export default function TrainingExtra({ extraOefeningen }) {
  const [tab, setTab] = useState('A');
  const [detailId, setDetailId] = useState(null);

  const detailOefening = detailId
    ? extraOefeningMetAfbeelding(ALLE_EXTRA.find((e) => e.id === detailId))
    : null;

  return (
    <div>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Extra oefeningen</div>
      <p className="of-stap-tekst">Thuisuitvoerbaar — dumbbells of barbell, geen gymtoestellen vereist. Tik op een naam voor uitleg en een afbeelding.</p>

      <div className="te-tabs">
        <button className={`te-tab ${tab === 'A' ? 'on' : ''}`} onClick={() => setTab('A')}>Training A</button>
        <button className={`te-tab ${tab === 'B' ? 'on' : ''}`} onClick={() => setTab('B')}>Training B</button>
      </div>

      {GROEPEN[tab].map(([key, titel]) => (
        <div className="card" key={key}>
          <div className="td-label">{titel}</div>
          {EXTRA[key].map((e) => (
            <div className="te-item" key={e.id}>
              <button type="button" className="te-info" onClick={() => setDetailId(e.id)}>
                <div className="te-naam">{e.naam}</div>
                <div className="te-spier">{e.spier} · <span className="te-equip">{e.equip}</span></div>
              </button>
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

      <div className="card">
        <div className="td-label">Ochtend-mobiliteit</div>
        <p className="ti-hint">
          Dezelfde spanning-verlichtende oefeningen als in de ochtendroutine — geen sets/reps om bij te
          houden, gewoon ter inspiratie of om tussen trainingen door te doen.
        </p>
        {SPANNING_OEFENINGEN.map((oef) => (
          <OefeningPopup key={oef.id} oefening={oef} />
        ))}
      </div>

      {detailOefening && (
        <Modal titel={detailOefening.naam} onClose={() => setDetailId(null)}>
          <OefeningDetail oefening={detailOefening} />
        </Modal>
      )}
    </div>
  );
}
