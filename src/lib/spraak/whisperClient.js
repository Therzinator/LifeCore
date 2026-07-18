// Eén gedeelde Worker voor de hele app — alle mic-knoppen (SpraakKnop/
// SpraakInvoer) roepen deze module aan, zodat het Whisper-model maar één
// keer gedownload en geladen wordt, ongeacht hoeveel invoervelden er zijn.

let worker = null;
const voortgangListeners = new Set();

function haalWorker() {
  if (!worker) {
    worker = new Worker(new URL('./whisperWorker.js', import.meta.url), { type: 'module' });
  }
  return worker;
}

export function onVoortgang(fn) {
  voortgangListeners.add(fn);
  return () => voortgangListeners.delete(fn);
}

export function transcribeer(audioData) {
  return new Promise((resolve, reject) => {
    const w = haalWorker();

    function opBericht(event) {
      const { type, payload } = event.data;
      if (type === 'voortgang') {
        voortgangListeners.forEach((fn) => fn(payload));
        return;
      }
      if (type === 'resultaat') {
        w.removeEventListener('message', opBericht);
        resolve(payload.tekst);
        return;
      }
      if (type === 'fout') {
        w.removeEventListener('message', opBericht);
        reject(new Error(payload?.bericht ?? 'Transcriptie mislukt'));
        return;
      }
      // Onbekend berichttype (bv. 'device') — negeren, niet de belofte beslechten.
    }

    w.addEventListener('message', opBericht);
    w.postMessage({ type: 'transcribeer', audio: audioData }, [audioData.buffer]);
  });
}
