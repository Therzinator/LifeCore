import { useEffect, useState } from 'react';

const BREEKPUNT = '(min-width: 1024px)';

// Simpele breakpoint-hook — LifeCore heeft geen rollen/install-gate zoals het
// zusterproject Constatum, dus volstaat hier een viewportbreedte-check zonder
// touch-/user-agent-heuristiek of sessie-override.
export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(BREEKPUNT).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(BREEKPUNT);
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return isDesktop;
}
