import { useState } from 'react';
import { IconInstellingen } from './ModuleIconen.jsx';
import Modal from './Modal.jsx';
import './ModuleInstellingenKnop.css';

// Lichte, herbruikbare knop+Modal-combinatie — GEEN los, groot
// instellingensysteem. Elke module plaatst deze zelf in zijn eigen kop-rij
// (naast de titel, net als de bestaande "Waarom werkt dit?"-links en
// bibliotheek-knoppen), zodat instellingen direct bereikbaar zijn zonder
// eerst naar een aparte tab te hoeven wisselen.
export default function ModuleInstellingenKnop({ titel, children }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className="mik-knop" onClick={() => setOpen(true)} aria-label={`${titel} openen`}>
        <IconInstellingen className="mik-icoon" />
      </button>

      {open && (
        <Modal titel={titel} onClose={() => setOpen(false)}>
          {children}
        </Modal>
      )}
    </>
  );
}
