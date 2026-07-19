import { useCallback, useEffect, useRef, useState } from 'react';

// Wrapper om de browser-native SpeechSynthesis API — bewust geen externe
// TTS-library (net als de eerdere STT-keuze voor SpraakKnop): gratis, geen
// netwerk/API-key nodig, en 'goed genoeg' voor korte begeleidende zinnen
// i.p.v. een studio-kwaliteit stem.
export function useSpraakVoorlezer() {
  const beschikbaar = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [actief, setActief] = useState(false);
  const laatsteOnEindeRef = useRef(null);

  const spreek = useCallback((tekst, { onEinde } = {}) => {
    if (!beschikbaar || !tekst) { onEinde?.(); return; }
    window.speechSynthesis.cancel(); // vorige zin afbreken i.p.v. laten opstapelen
    laatsteOnEindeRef.current = onEinde ?? null;
    const utterance = new window.SpeechSynthesisUtterance(tekst);
    utterance.lang = 'nl-NL';
    utterance.onstart = () => setActief(true);
    utterance.onend = () => { setActief(false); laatsteOnEindeRef.current?.(); };
    utterance.onerror = () => { setActief(false); laatsteOnEindeRef.current?.(); };
    window.speechSynthesis.speak(utterance);
  }, [beschikbaar]);

  const stop = useCallback(() => {
    if (beschikbaar) window.speechSynthesis.cancel();
    setActief(false);
  }, [beschikbaar]);

  useEffect(() => () => { if (beschikbaar) window.speechSynthesis.cancel(); }, [beschikbaar]);

  return { beschikbaar, actief, spreek, stop };
}
