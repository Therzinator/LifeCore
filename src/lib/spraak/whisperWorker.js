import { pipeline } from '@huggingface/transformers';

// Multitalig Whisper-model (nodig voor Nederlands — de .en-varianten
// verstaan alleen Engels). 'base' is de balans tussen nauwkeurigheid en
// download-/verwerkingstijd op een telefoon; bij trage toestellen kan dit
// naar 'onnx-community/whisper-tiny' (kleiner, minder nauwkeurig).
//
const MODEL = 'onnx-community/whisper-base';

let transcriberPromise = null;

function haalTranscriber() {
  if (!transcriberPromise) {
    transcriberPromise = pipeline('automatic-speech-recognition', MODEL, {
      progress_callback: (data) => self.postMessage({ type: 'voortgang', payload: data }),
      // fp32 i.p.v. de standaard q8/NBits-quantisatie: die geeft met de
      // onnxruntime-web-versie die deze library bundelt een laadfout op de
      // decoder ("Missing required scale ... DequantizeLinear") — een
      // bekende bug (microsoft/onnxruntime#28306), geen fout in onze code.
      // Kost een grotere download, maar laadt gegarandeerd correct.
      dtype: 'fp32',
    });
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
