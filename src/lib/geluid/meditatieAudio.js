// Optionele, doorlopende meditatie-audio (los van de korte eind-signalen in
// fragmenten.js) — gebruikt door AdemMeditatie (Mindfulness) en
// StapAdemhaling (Ochtend). Bestanden leven in de Supabase Storage-bucket
// 'mindfulness-audio' (zelfde bucket als de bestaande mindfulness-sessies,
// zie lib/supabase/mindfulness.js audioUrl()) — te groot voor de git-repo
// (10 minuten ongecomprimeerd = 100+ MB).
//
// 5min.mp3/10min.mp3 zijn nog niet geüpload (bestanden volgen nog, te groot
// als .wav) — audioUrl() geeft dan gewoon een niet-bestaand pad terug en de
// audio speelt stilletjes niet af; de oefening blijft zonder geluid gewoon
// werken (zie useMeditatieAudioSpeler.js).
export const MEDITATIE_AUDIO_PAD = {
  3: 'ademmeditatie/3min.wav',
  5: 'ademmeditatie/5min.mp3',
  10: 'ademmeditatie/10min.mp3',
};

// Vaste keuze voor StapAdemhaling (Ochtend) — die heeft geen duur-keuze
// (open einde, 'zoveel cycli als je fijn vindt'), dus één representatieve
// track als achtergrond in plaats van een duur-afhankelijke keuze.
export const OCHTEND_ADEMHALING_AUDIO_PAD = MEDITATIE_AUDIO_PAD[5];
