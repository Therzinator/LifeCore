import { useState } from 'react';
import { OEFENINGEN_BIBLIOTHEEK } from '../../lib/training/schema.js';
import './TrainingProgramma.css';

const LETTERS = ['A', 'B'];
const CATEGORIEEN = [...new Set(OEFENINGEN_BIBLIOTHEEK.map((o) => o.categorie))];

function slug(naam) {
  return naam.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'oefening';
}

function LegeOefening() {
  return { presetId: '', naam: '', sets: 5, reps: 5, type: 'li', stangType: 'recht', spier: '', increment: 2.5, startgewicht: 20 };
}

export default function TrainingProgramma({ programma, profiel, instellingen, toonToast }) {
  const [letterVoorForm, setLetterVoorForm] = useState(null);
  const [form, setForm] = useState(LegeOefening());

  function kiesPreset(presetId) {
    const preset = OEFENINGEN_BIBLIOTHEEK.find((o) => o.id === presetId);
    if (!preset) {
      setForm({ ...LegeOefening(), increment: instellingen.gewichtStap });
      return;
    }
    setForm({
      presetId,
      naam: preset.naam, sets: preset.sets, reps: preset.reps, type: preset.type,
      stangType: preset.stangType, spier: preset.spier, increment: preset.increment,
      startgewicht: profiel.profiel.gewichten[preset.id] ?? 20,
    });
  }

  function openForm(letter) {
    setLetterVoorForm(letter);
    setForm({ ...LegeOefening(), increment: instellingen.gewichtStap });
  }

  function sluitForm() {
    setLetterVoorForm(null);
  }

  function toevoegen(e) {
    e.preventDefault();
    if (!form.naam.trim()) { toonToast('Vul een naam in', 'wn'); return; }
    const id = form.presetId || `eigen-${slug(form.naam)}-${Date.now()}`;

    programma.voegOefeningToe(letterVoorForm, {
      id, naam: form.naam.trim(), sets: form.sets, reps: form.reps,
      type: form.type, stangType: form.stangType, spier: form.spier.trim(), increment: form.increment,
    });

    if (profiel.profiel.gewichten[id] === undefined) {
      profiel.setGewicht(id, form.startgewicht);
    }

    toonToast(`"${form.naam}" toegevoegd aan Training ${letterVoorForm}`, 'ok');
    sluitForm();
  }

  function resetStandaard() {
    if (!window.confirm('Terug naar het standaardschema (StrongLifts 5×5)? Je aanpassingen aan Training A/B gaan verloren.')) return;
    programma.resetStandaard();
    toonToast('Standaardschema hersteld', 'neu');
  }

  return (
    <div>
      <div className="of-stap-titel" style={{ fontSize: 'var(--font-size-xl)' }}>Programma bewerken</div>
      <p className="of-stap-tekst">Voeg oefeningen toe, verwijder ze, of pas sets, reps en increment aan — net als in StrongLifts.</p>

      {LETTERS.map((letter) => (
        <div className="card" key={letter}>
          <div className="td-label">Training {letter}</div>
          <div className="tpr-lijst">
            {programma.programma[letter].map((oef, index) => (
              <div className="tpr-item" key={`${oef.id}-${index}`}>
                <div className="tpr-item-kop">
                  <span className="tpr-item-naam">{oef.naam}</span>
                  <div className="tpr-volgorde">
                    <button className="tpr-mini-btn" disabled={index === 0} onClick={() => programma.verplaatsOefening(letter, index, -1)}>↑</button>
                    <button className="tpr-mini-btn" disabled={index === programma.programma[letter].length - 1} onClick={() => programma.verplaatsOefening(letter, index, 1)}>↓</button>
                    <button className="tpr-verwijder" onClick={() => programma.verwijderOefening(letter, index)}>✕</button>
                  </div>
                </div>

                <div className="tpr-velden">
                  <label className="tpr-veld-grp">
                    <span className="tpr-veld-lbl">Sets</span>
                    <input
                      type="number" min="1" max="10" className="tpr-veld-input"
                      value={oef.sets}
                      onChange={(e) => programma.bewerkOefening(letter, index, { sets: parseInt(e.target.value, 10) || 1 })}
                    />
                  </label>
                  <label className="tpr-veld-grp">
                    <span className="tpr-veld-lbl">Reps</span>
                    <input
                      type="number" min="1" max="20" className="tpr-veld-input"
                      value={oef.reps}
                      onChange={(e) => programma.bewerkOefening(letter, index, { reps: parseInt(e.target.value, 10) || 1 })}
                    />
                  </label>
                  <label className="tpr-veld-grp">
                    <span className="tpr-veld-lbl">Increment (kg)</span>
                    <input
                      type="number" min="0.5" step="0.5" className="tpr-veld-input"
                      value={oef.increment}
                      onChange={(e) => programma.bewerkOefening(letter, index, { increment: parseFloat(e.target.value) || 2.5 })}
                    />
                  </label>
                  <label className="tpr-veld-grp">
                    <span className="tpr-veld-lbl">Zwaar/licht</span>
                    <select
                      className="tpr-veld-input"
                      value={oef.type}
                      onChange={(e) => programma.bewerkOefening(letter, index, { type: e.target.value })}
                    >
                      <option value="zw">Zwaar</option>
                      <option value="li">Licht</option>
                    </select>
                  </label>
                </div>
              </div>
            ))}
          </div>

          {letterVoorForm === letter ? (
            <form className="tpr-form" onSubmit={toevoegen}>
              <label className="tpr-veld-grp">
                <span className="tpr-veld-lbl">Kies een oefening</span>
                <select className="tpr-veld-input" value={form.presetId} onChange={(e) => kiesPreset(e.target.value)}>
                  <option value="">— Eigen oefening —</option>
                  {CATEGORIEEN.map((cat) => (
                    <optgroup label={cat} key={cat}>
                      {OEFENINGEN_BIBLIOTHEEK.filter((o) => o.categorie === cat).map((o) => (
                        <option key={o.id} value={o.id}>{o.naam}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </label>

              <label className="tpr-veld-grp">
                <span className="tpr-veld-lbl">Naam</span>
                <input
                  className="tpr-veld-input" type="text" value={form.naam}
                  onChange={(e) => setForm({ ...form, naam: e.target.value })}
                />
              </label>

              <div className="tpr-velden">
                <label className="tpr-veld-grp">
                  <span className="tpr-veld-lbl">Sets</span>
                  <input type="number" min="1" max="10" className="tpr-veld-input" value={form.sets} onChange={(e) => setForm({ ...form, sets: parseInt(e.target.value, 10) || 1 })} />
                </label>
                <label className="tpr-veld-grp">
                  <span className="tpr-veld-lbl">Reps</span>
                  <input type="number" min="1" max="20" className="tpr-veld-input" value={form.reps} onChange={(e) => setForm({ ...form, reps: parseInt(e.target.value, 10) || 1 })} />
                </label>
                <label className="tpr-veld-grp">
                  <span className="tpr-veld-lbl">Increment (kg)</span>
                  <input type="number" min="0.5" step="0.5" className="tpr-veld-input" value={form.increment} onChange={(e) => setForm({ ...form, increment: parseFloat(e.target.value) || 2.5 })} />
                </label>
                <label className="tpr-veld-grp">
                  <span className="tpr-veld-lbl">Startgewicht (kg)</span>
                  <input type="number" min="0" step="1.25" className="tpr-veld-input" value={form.startgewicht} onChange={(e) => setForm({ ...form, startgewicht: parseFloat(e.target.value) || 0 })} />
                </label>
              </div>

              <div className="tpr-velden">
                <label className="tpr-veld-grp">
                  <span className="tpr-veld-lbl">Zwaar/licht</span>
                  <select className="tpr-veld-input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="zw">Zwaar</option>
                    <option value="li">Licht</option>
                  </select>
                </label>
                <label className="tpr-veld-grp">
                  <span className="tpr-veld-lbl">Stang</span>
                  <select className="tpr-veld-input" value={form.stangType} onChange={(e) => setForm({ ...form, stangType: e.target.value })}>
                    <option value="recht">Recht</option>
                    <option value="curl">Curl (EZ-bar)</option>
                  </select>
                </label>
                <label className="tpr-veld-grp" style={{ flex: 2 }}>
                  <span className="tpr-veld-lbl">Spiergroep</span>
                  <input className="tpr-veld-input" type="text" value={form.spier} onChange={(e) => setForm({ ...form, spier: e.target.value })} />
                </label>
              </div>

              <div className="tpr-form-acties">
                <button className="btn btn-text" type="button" onClick={sluitForm}>Annuleren</button>
                <button className="btn btn-p" type="submit">Toevoegen</button>
              </div>
            </form>
          ) : (
            <button className="btn btn-g btn-sm" onClick={() => openForm(letter)}>+ Oefening toevoegen</button>
          )}
        </div>
      ))}

      <button className="btn btn-danger btn-sm" onClick={resetStandaard}>Herstel standaardschema</button>
    </div>
  );
}
