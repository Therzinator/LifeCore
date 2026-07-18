// Optionele lokale content-tool — GEEN onderdeel van de gebouwde app.
//
// Genereert een audiobestand voor een mindfulness_sessies-rij met
// audio_source = 'tts', uploadt het naar de Supabase Storage-bucket
// 'mindfulness-audio' en zet audio_pad op die rij. Na het draaien van dit
// script gedraagt een tts-sessie zich in de app identiek aan een recorded-
// sessie (zelfde <audio>-element, zelfde achtergrond-afspelen).
//
// Gebruikt hier OpenAI's TTS-endpoint als voorbeeld — vervang genereerAudio()
// als je een andere provider (Google/Azure/ElevenLabs) wilt gebruiken; de
// rest van het script (ophalen sessie, uploaden, bijwerken) blijft hetzelfde.
//
// Vereist twee geheimen die NOOIT in de client-bundle horen (dus geen
// VITE_-prefix, en niet in .env.example): SUPABASE_SERVICE_ROLE_KEY (uit het
// Supabase-dashboard, bypast RLS) en OPENAI_API_KEY.
//
// Gebruik:
//   node --env-file=.env scripts/genereer-tts.mjs <sessie_id>

import { createClient } from '@supabase/supabase-js';

const sessieId = process.argv[2];
if (!sessieId) {
  console.error('Gebruik: node --env-file=.env scripts/genereer-tts.mjs <sessie_id>');
  process.exit(1);
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Ontbrekende env-vars: VITE_SUPABASE_URL en/of SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function genereerAudio(tekst) {
  if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY ontbreekt.');

  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: 'tts-1', voice: 'alloy', input: tekst, response_format: 'mp3' }),
  });

  if (!res.ok) throw new Error(`TTS-aanroep mislukt: ${res.status} ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const { data: sessie, error } = await sb
    .from('mindfulness_sessies')
    .select('id, thema_id, audio_source, tts_tekst')
    .eq('id', sessieId)
    .single();

  if (error || !sessie) throw new Error(`Sessie niet gevonden: ${error?.message ?? sessieId}`);
  if (sessie.audio_source !== 'tts') throw new Error('Deze sessie heeft audio_source "recorded", niet "tts".');
  if (!sessie.tts_tekst) throw new Error('Deze sessie heeft geen tts_tekst om te synthetiseren.');

  console.log('Audio genereren...');
  const audioBuffer = await genereerAudio(sessie.tts_tekst);

  const pad = `${sessie.thema_id}/${sessie.id}.mp3`;
  console.log(`Uploaden naar ${pad}...`);
  const { error: uploadError } = await sb.storage
    .from('mindfulness-audio')
    .upload(pad, audioBuffer, { contentType: 'audio/mpeg', upsert: true });
  if (uploadError) throw new Error(`Upload mislukt: ${uploadError.message}`);

  const { error: updateError } = await sb
    .from('mindfulness_sessies')
    .update({ audio_pad: pad })
    .eq('id', sessieId);
  if (updateError) throw new Error(`Bijwerken audio_pad mislukt: ${updateError.message}`);

  console.log(`Klaar — ${pad} is gekoppeld aan sessie ${sessieId}.`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
