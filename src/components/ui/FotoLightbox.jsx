import './FotoLightbox.css';

// Interactieve foto-weergave — klik een thumbnail om te vergroten, klik
// nogmaals (overal op de overlay) om te sluiten.
export default function FotoLightbox({ url, onClose }) {
  if (!url) return null;

  return (
    <div className="fl-overlay" onClick={onClose} role="button" tabIndex={-1} aria-label="Sluiten">
      <img src={url} alt="" className="fl-foto" />
      <button type="button" className="fl-sluit" onClick={onClose} aria-label="Sluiten">✕</button>
    </div>
  );
}
