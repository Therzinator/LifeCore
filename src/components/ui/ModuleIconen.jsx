// Eén centrale set inline-SVG-iconen (fill="currentColor") voor de vijf
// modules + navigatie-chrome — hergebruikt door DesktopShell, BottomNav en
// SnelkeuzeScherm zodat de gebruiker dezelfde vorm overal terugherkent.

export function IconOchtend(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="14" r="5" fill="currentColor" />
      <path d="M12 2v3M4.2 7.2l2.1 2.1M19.8 7.2l-2.1 2.1M2 14h3M19 14h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconWaarden(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M14.5 9.5 12 12l-2.5 2.5L12 12l2.5-2.5Z" fill="currentColor" />
    </svg>
  );
}

export function IconWelzijn(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 20.5 4.6 13.2a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9a4.6 4.6 0 0 1 6.5 6.5L12 20.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconMindfulness(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 3c1 3-3 4-3 7a3 3 0 0 0 6 0c0-3-4-4-3-7Z"
        fill="currentColor"
      />
      <path d="M4 14c2 4 6 6 8 6s6-2 8-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconTraining(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M4 12h1M19 12h1M6 8v8M18 8v8M9 12h6"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconSnelkeuze(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" />
      <rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor" opacity=".55" />
      <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" opacity=".55" />
      <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor" opacity=".55" />
    </svg>
  );
}

export function IconChevron(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export const MODULE_ICONEN = {
  ochtend: IconOchtend,
  waarden: IconWaarden,
  welzijn: IconWelzijn,
  mindfulness: IconMindfulness,
  training: IconTraining,
};
