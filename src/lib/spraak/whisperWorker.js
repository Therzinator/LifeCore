import { pipeline } from '@huggingface/transformers';

// Multitalig Whisper-model (nodig voor Nederlands — de .en-varianten
// verstaan alleen Engels). 'tiny' i.p.v. 'base': ~5x minder parameters,
// dus een veel kleinere download en veel snellere inferentie op een
// telefoon — 'base' bleek in de praktijk onbruikbaar traag.
const MODEL = 'onnx-community/whisper-tiny';

// De standaard q8/NBits-quantisatie geeft met de onnxruntime-web-versie
// die deze library bundelt een laadfout op de decoder ("Missing required
// scale ... DequantizeLinear") — een bekende bug (microsoft/onnxruntime
// #28306). We quantiseren daarom alleen de encoder (kleiner/sneller, geen
// bekende bug daar) en houden de decoder op fp32 (waar de bug wél zit).
const DTYPE = { encoder_model: 'q8', decoder_model_merged: 'fp32' };

let transcriberPromise = null;

async function bepaalDevice() {
  if (self.navigator?.gpu) {
    try {
      const adapter = await self.navigator.gpu.requestAdapter();
      if (adapter) return 'webgpu';
    } catch {
      // valt door naar wasm
    }
  }
  return 'wasm';
}

async function laadTranscriber(device) {
  return pipeline('automatic-speech-recognition', MODEL, {
    device,
    dtype: DTYPE,
    progress_callback: (data) => self.postMessage({ type: 'voortgang', payload: data }),
  });
}

function haalTranscriber() {
  if (!transcriberPromise) {
    transcriberPromise = bepaalDevice()
      .then((device) => {
        self.postMessage({ type: 'device', payload: { device } });
        return laadTranscriber(device);
      })
      .catch(() => laadTranscriber('wasm'));
  }
  return transcriberPromise;
}

self.addEventListener('message', async (event) => {
  const { type, audio } = event.data;
  if (type !== 'transcribeer') return;

  try {
    const transcriber = await haalTranscriber();
    const resultaat = await transcriber(audio, { language: 'dutch', task: 'transcribe' });
    self.postMessage({ type: 'resultaat', payload: { tekst: (resultaat.text ?? '').trim() } });
  } catch (err) {
    self.postMessage({ type: 'fout', payload: { bericht: err?.message ?? String(err) } });
  }
});
