import { useEffect, useRef } from 'react';
import './Modal.css';

export default function Modal({ titel, onClose, children }) {
  const sluitKnopRef = useRef(null);
  const vlakRef = useRef(null);

  useEffect(() => {
    sluitKnopRef.current?.focus();
  }, []);

  useEffect(() => {
    function opToets(e) {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const focusbaar = vlakRef.current?.querySelectorAll(
        'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusbaar || focusbaar.length === 0) return;

      const eerste = focusbaar[0];
      const laatste = focusbaar[focusbaar.length - 1];

      if (e.shiftKey && document.activeElement === eerste) {
        e.preventDefault();
        laatste.focus();
      } else if (!e.shiftKey && document.activeElement === laatste) {
        e.preventDefault();
        eerste.focus();
      }
    }
    document.addEventListener('keydown', opToets);
    return () => document.removeEventListener('keydown', opToets);
  }, [onClose]);

  return (
    <div className="modal-scrim" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-vlak" ref={vlakRef} role="dialog" aria-modal="true" aria-label={titel}>
        <div className="modal-kop">
          <div className="modal-titel">{titel}</div>
          <button ref={sluitKnopRef} className="modal-sluit" onClick={onClose} aria-label="Sluiten">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
