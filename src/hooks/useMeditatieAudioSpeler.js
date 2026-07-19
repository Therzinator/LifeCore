import { useEffect, useRef } from 'react';
import { audioUrl } from '../lib/supabase/mindfulness.js';

// Studio-fade-out-duur: hoelang vóór het einde van de gekozen sessieduur het
// volume geleidelijk naar 0 loopt, i.p.v. de audio abrupt af te kappen zodra
// de timer op 0 staat. Zo kan één doorlopend (geloopt) bestand toch bij elke
// gekozen duur (3/5/10 min) netjes 'passend' aflopen.
const FADE_MS = 10000;
const FADE_STAP_MS = 100;

function fadeUitEnStop(el) {
  const stappen = FADE_MS / FADE_STAP_MS;
  const startVolume = el.volume;
  let stap = 0;
  return setInterval(() => {
    stap += 1;
    el.volume = Math.max(0, startVolume * (1 - stap / stappen));
    if (stap >= stappen) {
      el.pause();
      el.volume = 1;
    }
  }, FADE_STAP_MS);
}

// Speelt/pauzeert een doorlopende meditatie-audiotrack op basis van
// actief/aan — gedeeld door AdemMeditatie (Mindfulness) en StapAdemhaling
// (Ochtend), die verder identiek gedrag nodig hebben: audio start zodra de
// oefening loopt ÉN de gebruiker 'm heeft aangezet, en stopt zodra een van
// beide niet meer waar is. Het bestand loopt (loop=true) zodat het ook een
// langere sessie (10 min) kan vullen ook al is het bronbestand korter.
// resterendSeconden (optioneel, alleen AdemMeditatie geeft 'm door — die
// heeft een vaste gekozen duur, StapAdemhaling niet) triggert een studio-
// fade-out (zie FADE_MS) vlak vóór het natuurlijke einde van de sessie.
// Ontbreekt het bestand (nog niet geüpload) of is Supabase niet
// geconfigureerd, dan geeft audioUrl() null terug en blijft de oefening
// gewoon stil werken — nooit een harde vereiste.
export function useMeditatieAudioSpeler(audioRef, { actief, audioAan, pad, resterendSeconden = null }) {
  const fadeTimerRef = useRef(null);
  const fadeGestartRef = useRef(false);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return undefined;

    if (actief && audioAan && pad) {
      const url = audioUrl(pad);
      if (url && el.src !== url) {
        el.src = url;
        el.currentTime = 0;
        el.loop = true;
      }
      clearInterval(fadeTimerRef.current);
      el.volume = 1;
      fadeGestartRef.current = false;
      if (url) el.play().catch(() => {});
    } else {
      clearInterval(fadeTimerRef.current);
      el.pause();
      el.volume = 1;
      fadeGestartRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- alleen bij start/stop/aan-uit-wisselen, niet bij elke seconde-tick van de oefening zelf.
  }, [actief, audioAan, pad]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !actief || !audioAan || resterendSeconden == null) return;
    if (fadeGestartRef.current || el.paused) return;
    if (resterendSeconden * 1000 <= FADE_MS) {
      fadeGestartRef.current = true;
      fadeTimerRef.current = fadeUitEnStop(el);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- alleen checken bij elke seconde-tick van resterendSeconden, niet bij actief/audioAan zelf (die worden al door het effect hierboven afgehandeld).
  }, [resterendSeconden]);

  useEffect(() => () => clearInterval(fadeTimerRef.current), []);
}
