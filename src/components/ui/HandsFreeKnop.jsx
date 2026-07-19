import './HandsFreeKnop.css';

// Toggle voor hands-free voorlezen — los van SpraakKnop (die is een
// eenmalige spraak-naar-tekst-opname). De uitspreek-logica zelf leeft in
// het component dat deze knop gebruikt (elke oefening heeft een eigen
// stappen-/fasestructuur om op te reageren), deze knop is puur de UI.
export default function HandsFreeKnop({ actief, onToggle, beschikbaar }) {
  if (!beschikbaar) return null;

  return (
    <button
      type="button"
      className={`hf-knop ${actief ? 'actief' : ''}`}
      onClick={onToggle}
      aria-label={actief ? 'Hands-free voorlezen uitzetten' : 'Hands-free voorlezen aanzetten'}
    >
      {actief ? '🔊 Hands-free aan' : '🔈 Hands-free'}
    </button>
  );
}
