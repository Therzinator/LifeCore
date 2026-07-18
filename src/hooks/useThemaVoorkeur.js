import { useCallback, useState } from 'react';
import { leesLokaal, schrijfLokaal } from '../lib/storage/lokaal.js';

// Puur lokale UI-voorkeur (net als actieve_pagina/zijbalk_ingeklapt) — geen
// sync_status/nieuwRecord nodig, wordt nooit gesynchroniseerd.
export function useThemaVoorkeur() {
  const [thema, setThemaState] = useState(() => leesLokaal('thema_voorkeur', 'donker'));

  const setThema = useCallback((nieuw) => {
    schrijfLokaal('thema_voorkeur', nieuw);
    setThemaState(nieuw);
  }, []);

  return { thema, setThema };
}
