import { useCallback, useEffect, useRef, useState } from 'react';
import { transcribeer, onVoortgang } from '../lib/spraak/whisperClient.js';
import { blobNaarFloat32 } from '../lib/spraak/audioOpname.js';

export function useSpraakHerkenning(waarde, onWaarde) {
  const [opnemen, setOpnemen] = useState(false);
  const [verwerken, setVerwerken] = useState(false);
  const [laadVoortgang, setLaadVoortgang] = useState(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  const ondersteund = Boolean(navigator.mediaDevices?.getUserMedia && window.MediaRecorder);

  useEffect(() => onVoortgang((data) => {
    if (data.status === 'progress' && typeof data.progress === 'number') {
      setLaadVoortgang(Math.round(data.progress));
    } else if (data.status === 'done' || data.status === 'ready') {
      setLaadVoortgang(null);
    }
  }), []);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const startOpnemen = useCallback(async () => {
    if (!ondersteund) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.start();
      recorderRef.current = recorder;
      setOpnemen(true);
    } catch {
      // Microfoontoegang geweigerd of niet beschikbaar — stilletjes negeren,
      // net als bij de vorige (Web Speech API-)implementatie.
      setOpnemen(false);
    }
  }, [ondersteund]);

  const stopOpnemen = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder) return;

    recorder.onstop = async () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setOpnemen(false);

      const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
      chunksRef.current = [];
      if (blob.size === 0) return;

      setVerwerken(true);
      try {
        const audio = await blobNaarFloat32(blob);
        const tekst = await transcribeer(audio);
        if (tekst) {
          onWaarde(waarde ? `${waarde} ${tekst}` : tekst);
        }
      } catch (err) {
        console.error('Transcriptie mislukt', err);
      } finally {
        setVerwerken(false);
      }
    };
    recorder.stop();
  }, [waarde, onWaarde]);

  return { ondersteund, opnemen, verwerken, laadVoortgang, startOpnemen, stopOpnemen };
}
