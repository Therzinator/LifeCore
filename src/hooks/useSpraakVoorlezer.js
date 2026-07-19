import { useCallback, useEffect, useRef, useState } from 'react';

// Wrapper om de browser-native SpeechSynthesis API — bewust geen externe
// TTS-library (net als de eerdere STT-keuze voor SpraakKnop): gratis, geen
// netwerk/API-key nodig, en 'goed genoeg' voor korte begeleidende zinnen
// i.p.v. een studio-kwaliteit stem.
//
// utterance.lang = 'nl-NL' alleen is niet genoeg: zonder een expliciete
// utterance.voice kiest de browser vaak gewoon de systeem-standaardstem
// (op Windows meestal een Engelse SAPI-stem) en leest de tekst daar fonetisch
// mee voor — vandaar klinkt het "nergens naar". getVoices() laadt async (pas
// gevuld na het eerste 'voiceschanged'-event in sommige browsers), dus we
// cachen het resultaat pas zodra de lijst niet meer leeg is.
function vindNederlandseStem() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const stemmen = window.speechSynthesis.getVoices();
  return stemmen.find((s) => s.lang?.toLowerCase().startsWith('nl')) ?? null;
}

export function useSpraakVoorlezer() {
  const beschikbaar = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [actief, setActief] = useState(false);
  const laatsteOnEindeRef = useRef(null);
  const nlStemRef = useRef(null);

  useEffect(() => {
    if (!beschikbaar) return undefined;
    nlStemRef.current = vindNederlandseStem();
    const opNieuw = () => { nlStemRef.current = vindNederlandseStem(); };
    window.speechSynthesis.addEventListener('voiceschanged', opNieuw);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', opNieuw);
  }, [beschikbaar]);

  const spreek = useCallback((tekst, { onEinde } = {}) => {
    if (!beschikbaar || !tekst) { onEinde?.(); return; }
    window.speechSynthesis.cancel(); // vorige zin afbreken i.p.v. laten opstapelen
    laatsteOnEindeRef.current = onEinde ?? null;
    const utterance = new window.SpeechSynthesisUtterance(tekst);
    utterance.lang = 'nl-NL';
    // Geen Nederlandse stem geïnstalleerd op dit apparaat/OS: lang blijft
    // 'nl-NL' staan (correcter dan niets), maar er is dan geen betere stem
    // te kiezen — dat is een systeembeperking, geen bug in de app.
    if (nlStemRef.current) utterance.voice = nlStemRef.current;
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
