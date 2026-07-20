import { useState } from 'react';
import { useNotities } from '../../hooks/useNotities.js';
import { formatteerNotitiesVoorExport } from '../../lib/notities/notitieExport.js';
import { MODULES } from '../../lib/nav/modules.js';
import { IconNotitie } from './ModuleIconen.jsx';
import Modal from './Modal.jsx';
import './NotitiesKnop.css';

const MODULE_LABEL_FALLBACK = { snelkeuze: 'Snelkeuze' };

function moduleLabel(moduleId) {
  return MODULES[moduleId]?.label ?? MODULE_LABEL_FALLBACK[moduleId] ?? moduleId ?? 'Algemeen';
}

// Vaste knop rechtsboven (links van het account-icoon, zie AppHeader/
// DesktopShell) — snel een notitie loggen bij de module die je nu open
// hebt staan, later in bulk te exporteren (kopiëren) om in een Claude
// Code-sessie te plakken en te laten verwerken. Bewust geen aparte pagina/
// route: dit moet vanuit elke module in twee tikken bereikbaar zijn.
export default function NotitiesKnop({ huidigeModule }) {
  const notities = useNotities();
  const [open, setOpen] = useState(false);
  const [tekst, setTekst] = useState('');
  const [gekopieerd, setGekopieerd] = useState(false);

  function voegToe() {
    notities.voegToe(huidigeModule, tekst);
    setTekst('');
  }

  function kopieerAlles() {
    const geformatteerd = formatteerNotitiesVoorExport(notities.notities);
    navigator.clipboard?.writeText(geformatteerd);
    setGekopieerd(true);
    setTimeout(() => setGekopieerd(false), 2000);
  }

  function wisAlles() {
    if (!window.confirm(`Alle ${notities.notities.length} notities verwijderen? Dit kan niet ongedaan worden gemaakt.`)) return;
    notities.wisAlles();
  }

  return (
    <>
      <button type="button" className="notities-btn" onClick={() => setOpen(true)} aria-label="Notities">
        <IconNotitie className="notities-icoon" />
        {notities.notities.length > 0 && <span className="notities-badge">{notities.notities.length}</span>}
      </button>

      {open && (
        <Modal titel="Notities" onClose={() => setOpen(false)}>
          <div className="nk-toevoegen">
            <div className="nk-huidige-module">Notitie bij: <strong>{moduleLabel(huidigeModule)}</strong></div>
            <textarea
              className="nk-textarea"
              value={tekst}
              onChange={(e) => setTekst(e.target.value)}
              placeholder="Wat wil je later laten verwerken?"
              rows={3}
            />
            <button type="button" className="btn btn-p btn-full" onClick={voegToe} disabled={!tekst.trim()}>
              Notitie toevoegen
            </button>
          </div>

          {notities.notities.length > 0 && (
            <>
              <div className="nk-export-rij">
                <button type="button" className="btn btn-g btn-sm" onClick={kopieerAlles}>
                  {gekopieerd ? '✓ Gekopieerd' : `Kopieer alles (${notities.notities.length})`}
                </button>
                <button type="button" className="btn btn-text" onClick={wisAlles}>Wis alles</button>
              </div>
              <p className="ti-hint">Plak dit in een Claude Code-sessie in de terminal om te laten verwerken.</p>

              <div className="nk-lijst">
                {notities.notities.map((n) => (
                  <div key={n.id} className="nk-item">
                    <div className="nk-item-kop">
                      <span className="nk-item-module">{moduleLabel(n.moduleId)}</span>
                      <span className="nk-item-datum">
                        {new Date(n.aangemaaktOp).toLocaleString('nl-NL', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                    <div className="nk-item-tekst">{n.tekst}</div>
                    <button type="button" className="nk-item-verwijder" onClick={() => notities.verwijder(n.id)} aria-label="Notitie verwijderen">
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </Modal>
      )}
    </>
  );
}
