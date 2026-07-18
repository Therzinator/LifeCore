import { pipeline } from '@huggingface/transformers';

// Multitalig Whisper-model (nodig voor Nederlands — de .en-varianten
// verstaan alleen Engels).
//
// Teruggedraaid naar 'base' + volledig fp32: een eerdere poging om dit te
// versnellen ('tiny'-model + gemengde q8/fp32-precisie + geforceerde
// webgpu-device) leverde in de praktijk juist een tragere ÉN veel minder
// accurate transcriptie op (bevestigd door de gebruiker op een echt
// toestel — iets wat met de synthetische fake-audio in Playwright-tests
// niet te detecteren was). 'base'+fp32 was wél accuraat, dus dat is de
// vaste basis; snelheidswinst moet vanaf hier via een andere weg gezocht
// worden, niet door model/precisie opnieuw te verlagen zonder dat op een
// echt toestel te kunnen verifiëren.
const MODEL = 'onnx-community/whisper-base';

let transcriberPromise = null;

function haalTranscriber() {
  if (!transcriberPromise) {
    transcriberPromise = pipeline('automatic-speech-recognition', MODEL, {
      // fp32 i.p.v. de standaard q8/NBits-quantisatie: die geeft met de
      // onnxruntime-web-versie die deze library bundelt een laadfout op de
      // decoder ("Missing required scale ... DequantizeLinear") — een
      // bekende bug (microsoft/onnxruntime#28306), geen fout in onze code.
      dtype: 'fp32',
      progress_callback: (data) => self.postMessage({ type: 'voortgang', payload: data }),
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
