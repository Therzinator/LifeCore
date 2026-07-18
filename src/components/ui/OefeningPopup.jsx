import { useState } from 'react';
import Modal from './Modal.jsx';
import OefeningDetail from './OefeningDetail.jsx';
import './OefeningPopup.css';

// Eén oefening, standaard ingeklapt (naam + korte tekst) — tikken opent een
// popup met afbeelding + volledige uitleg, sluitknop rechtsboven (via de
// gedeelde Modal). Gebruikt voor oefeningen die inline in een flow getoond
// worden (bv. de kern-oefeningen in de ochtendroutine).
export default function OefeningPopup({ oefening }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="oe-rij">
      <button type="button" className="oe-toggle" onClick={() => setOpen(true)}>
        <span className="oe-naam">{oefening.naam}</span>
        <span className="oe-kort">{oefening.kort}</span>
      </button>

      {open && (
        <Modal titel={oefening.naam} onClose={() => setOpen(false)}>
          <OefeningDetail oefening={oefening} />
        </Modal>
      )}
    </div>
  );
}
