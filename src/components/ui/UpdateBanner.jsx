import './UpdateBanner.css';

export default function UpdateBanner({ actief, onBijwerken, onNegeren }) {
  if (!actief) return null;

  return (
    <div className="ub-wrap" role="status">
      <span className="ub-tekst">Nieuwe versie beschikbaar</span>
      <div className="ub-acties">
        <button type="button" className="ub-btn" onClick={onBijwerken}>Vernieuwen</button>
        <button type="button" className="ub-negeer-btn" onClick={onNegeren} aria-label="Sluiten">✕</button>
      </div>
    </div>
  );
}
