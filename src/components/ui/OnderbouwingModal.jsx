import Modal from './Modal.jsx';
import { onderbouwing } from '../../lib/kaders/onderbouwing.js';

export default function OnderbouwingModal({ sleutel, onClose }) {
  const info = onderbouwing(sleutel);
  if (!info) return null;

  return (
    <Modal titel={info.titel} onClose={onClose}>
      <p style={{ lineHeight: 1.65, marginBottom: 'var(--space-md)', color: 'var(--txt)' }}>
        {info.tekst}
      </p>
      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--txt-faint)' }}>{info.bron}</p>
    </Modal>
  );
}
