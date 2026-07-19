// Optionele, doorlopende meditatie-audio (los van de korte eind-signalen in
// fragmenten.js) — gebruikt door AdemMeditatie (Mindfulness) en
// StapAdemhaling (Ochtend). Bestand leeft in de Supabase Storage-bucket
// 'mindfulness-audio' (zelfde bucket als de bestaande mindfulness-sessies,
// zie lib/supabase/mindfulness.js audioUrl()).
//
// Eén instrumentaal/ambient bestand voor alle duren (3/5/10 min) i.p.v. een
// apart bestand per duur — useMeditatieAudioSpeler.js loopt het net zo vaak
// als nodig en bouwt zelf een studio-fade-out van 10s vóór het einde van de
// gekozen sessieduur, dus er hoeft geen per-duur montage geüpload te worden.
// Werkt alleen omdat het geluid geen gesproken tekst bevat — een afgekapte
// zin zou wél een probleem zijn.
export const MEDITATIE_AUDIO_PAD = 'ademmeditatie/meditatie.mp3';

// Vaste keuze voor StapAdemhaling (Ochtend) — die heeft geen duur-keuze
// (open einde, 'zoveel cycli als je fijn vindt'), dus hetzelfde bestand als
// achtergrond, zonder de duur-gebaseerde fade-out (zie
// useMeditatieAudioSpeler.js — resterendSeconden blijft daar ongebruikt).
export const OCHTEND_ADEMHALING_AUDIO_PAD = MEDITATIE_AUDIO_PAD;
