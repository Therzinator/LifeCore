const WHISPER_SAMPLERATE = 16000;

// MediaRecorder levert een gecomprimeerde blob (webm/opus e.d.) — Whisper
// verwacht rauwe mono PCM-samples op 16kHz. Decoderen + resamplen via
// OfflineAudioContext (downmixt automatisch naar mono bij het renderen
// naar een 1-kanaals destination).
export async function blobNaarFloat32(blob) {
  const arrayBuffer = await blob.arrayBuffer();
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const decodeCtx = new AudioCtx();
  let audioBuffer;
  try {
    audioBuffer = await decodeCtx.decodeAudioData(arrayBuffer);
  } finally {
    decodeCtx.close();
  }

  if (audioBuffer.sampleRate === WHISPER_SAMPLERATE && audioBuffer.numberOfChannels === 1) {
    return audioBuffer.getChannelData(0);
  }

  const duurInSamples = Math.ceil(audioBuffer.duration * WHISPER_SAMPLERATE);
  const offlineCtx = new OfflineAudioContext(1, duurInSamples, WHISPER_SAMPLERATE);
  const bron = offlineCtx.createBufferSource();
  bron.buffer = audioBuffer;
  bron.connect(offlineCtx.destination);
  bron.start();
  const gerenderd = await offlineCtx.startRendering();
  return gerenderd.getChannelData(0);
}
