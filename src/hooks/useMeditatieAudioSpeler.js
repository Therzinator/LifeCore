import { useEffect, useRef } from 'react';
import { audioUrl } from '../lib/supabase/mindfulness.js';

// Studio-fade-out-venster: hoeveel seconden vóór het einde van de gekozen
// sessieduur het volume geleidelijk naar 0 loopt.
const FADE_SECONDEN = 10;
// Elke seconden-tik van de sessietimer (zie resterendSeconden) rampt het
// volume binnen RAMP_MS naar het nieuwe doel — ruim korter dan de 1s tussen
// tikken, zodat het altijd 'bij' is vóór de volgende tik komt.
const RAMP_MS = 900;
const RAMP_STAP_MS = 50;

// Een pad dat met '/' begint is een lokaal bestand uit public/ (bv. de
// meegeleverde SFX-audio) — direct als URL bruikbaar. Alle andere paden zijn
// Supabase-storage-keys (zie GELEIDE_ADEMHALING_AUDIO_PAD vs.
// MEDITATIE_AUDIO_PAD in lib/geluid/meditatieAudio.js), die audioUrl() moet
// resolven en die null teruggeven als Supabase niet geconfigureerd is.
function resolveerUrl(pad) {
  if (!pad) return null;
  if (pad.startsWith('/')) return pad;
  return audioUrl(pad);
}

function rampVolumeNaar(el, doelVolume, timerRef) {
  clearInterval(timerRef.current);
  const startVolume = el.volume;
  const stappen = RAMP_MS / RAMP_STAP_MS;
  let stap = 0;
  timerRef.current = setInterval(() => {
    stap += 1;
    const t = Math.min(1, stap / stappen);
    el.volume = startVolume + (doelVolume - startVolume) * t;
    if (t >= 1) clearInterval(timerRef.current);
  }, RAMP_STAP_MS);
}

// Speelt/pauzeert een doorlopende meditatie-audiotrack op basis van
// actief/aan — gedeeld door AdemMeditatie (Mindfulness) en StapAdemhaling
// (Ochtend), die verder identiek gedrag nodig hebben: audio start zodra de
// oefening loopt ÉN de gebruiker 'm heeft aangezet, en stopt zodra een van
// beide niet meer waar is. Het bestand loopt (loop=true) zodat het ook een
// langere sessie (10 min) kan vullen ook al is het bronbestand korter.
//
// resterendSeconden (optioneel, alleen AdemMeditatie geeft 'm door — die
// heeft een vaste gekozen duur, StapAdemhaling niet) bepaalt elke seconde
// het DOEL-volume rechtstreeks (1.0 tot FADE_SECONDEN vóór het einde,
// lineair aflopend naar 0.0 één tik vóór het natuurlijke einde). Bewust
// GEEN los 10-seconden-aftel-timertje meer: dat liep als eigen klok naast
// de sessietimer, en kwam door normale JS-scheduling-jitter bijna nooit
// exact op hetzelfde moment uit als het moment waarop de sessie 'klaar'
// wordt en actief hieronder naar false klapt — met een hoorbaar abrupt
// afkapmoment tot gevolg zodra dat gebeurde vóórdat de fade voltooid was.
// Door het doel-volume rechtstreeks uit dezelfde resterendSeconden-klok af
// te leiden die ook 'klaar' bepaalt, staat het volume altijd al op 0 vóórdat
// de harde stop (hieronder, bij actief=false) code komt aanraken.
//
// sessieId (optioneel): verhoog 'm bij een ECHTE nieuwe start (niet bij
// hervatten na pauze) — resetten van currentTime/volume gebeurt alleen dan,
// zodat pauzeren/hervatten tijdens de laatste 10s het opgebouwde fade-effect
// niet terugzet naar vol volume.
//
// Ontbreekt het bestand (nog niet geüpload) of is Supabase niet
// geconfigureerd, dan geeft audioUrl() null terug en blijft de oefening
// gewoon stil werken — nooit een harde vereiste.
export function useMeditatieAudioSpeler(audioRef, {
  actief, audioAan, pad, resterendSeconden = null, sessieId = 0,
}) {
  const rampTimerRef = useRef(null);
  const laatsteSessieRef = useRef(null);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return undefined;
    clearInterval(rampTimerRef.current);

    if (actief && audioAan && pad) {
      const url = resolveerUrl(pad);
      const verseSessie = laatsteSessieRef.current !== sessieId;
      if (url && (el.src !== url || verseSessie)) {
        el.src = url;
        el.currentTime = 0;
        el.loop = true;
        el.volume = 1;
      }
      laatsteSessieRef.current = sessieId;
      if (url) el.play().catch(() => {});
    } else {
      el.pause();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- alleen bij start/stop/aan-uit-wisselen of een echt nieuwe sessie, niet bij elke seconde-tick van de oefening zelf.
  }, [actief, audioAan, pad, sessieId]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !actief || !audioAan || resterendSeconden == null || el.paused) return;
    const doelVolume = resterendSeconden >= FADE_SECONDEN
      ? 1
      : Math.max(0, (resterendSeconden - 1) / (FADE_SECONDEN - 1));
    rampVolumeNaar(el, doelVolume, rampTimerRef);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- alleen bij elke seconde-tick van resterendSeconden reageren.
  }, [resterendSeconden]);

  useEffect(() => () => clearInterval(rampTimerRef.current), []);
}
