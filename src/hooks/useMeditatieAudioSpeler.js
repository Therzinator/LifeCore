import { useEffect } from 'react';
import { audioUrl } from '../lib/supabase/mindfulness.js';

// Speelt/pauzeert een doorlopende meditatie-audiotrack op basis van
// actief/aan — gedeeld door AdemMeditatie (Mindfulness) en StapAdemhaling
// (Ochtend), die verder identiek gedrag nodig hebben: audio start zodra de
// oefening loopt ÉN de gebruiker 'm heeft aangezet, en stopt zodra een van
// beide niet meer waar is. Ontbreekt het bestand (nog niet geüpload) of is
// Supabase niet geconfigureerd, dan geeft audioUrl() null terug en blijft
// de oefening gewoon stil werken — nooit een harde vereiste.
export function useMeditatieAudioSpeler(audioRef, { actief, audioAan, pad }) {
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    if (actief && audioAan && pad) {
      const url = audioUrl(pad);
      if (url && el.src !== url) {
        el.src = url;
        el.currentTime = 0;
      }
      if (url) el.play().catch(() => {});
    } else {
      el.pause();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- alleen bij start/stop/aan-uit-wisselen, niet bij elke seconde-tick van de oefening zelf.
  }, [actief, audioAan, pad]);
}
