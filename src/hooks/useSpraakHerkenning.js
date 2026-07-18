import { useEffect, useRef, useState } from 'react';

function haalSpeechRecognition() {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function useSpraakHerkenning(waarde, onWaarde) {
  const [opnemen, setOpnemen] = useState(false);
  const herkenningRef = useRef(null);
  const basisTekstRef = useRef('');
  const huidigeTekstRef = useRef('');
  const luisterenActiefRef = useRef(false);

  const ondersteund = Boolean(haalSpeechRecognition());

  useEffect(() => () => {
    luisterenActiefRef.current = false;
    herkenningRef.current?.stop();
  }, []);

  function maakHerkenning() {
    const Herkenning = haalSpeechRecognition();
    const herkenning = new Herkenning();
    herkenning.lang = 'nl-NL';
    herkenning.continuous = true;
    herkenning.interimResults = true;

    herkenning.onresult = (event) => {
      // Chrome levert elke afgeronde zin als los resultaat aan; zonder expliciete
      // spatie tussen die resultaten plakken woorden uit opeenvolgende zinnen aan elkaar.
      let tekst = '';
      for (let i = 0; i < event.results.length; i++) {
        const segment = event.results[i][0].transcript.trim();
        if (!segment) continue;
        tekst += (tekst ? ' ' : '') + segment;
      }
      huidigeTekstRef.current = basisTekstRef.current + tekst;
      onWaarde(huidigeTekstRef.current);
    };
    herkenning.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      luisterenActiefRef.current = false;
      setOpnemen(false);
    };
    herkenning.onend = () => {
      if (!luisterenActiefRef.current) {
        setOpnemen(false);
        return;
      }
      // Chrome sluit een continue sessie soms zelf af na een korte stilte —
      // naadloos herstarten zodat een langere dictatie niet stilzwijgend afbreekt.
      basisTekstRef.current = huidigeTekstRef.current ? `${huidigeTekstRef.current} ` : '';
      const nieuw = maakHerkenning();
      herkenningRef.current = nieuw;
      nieuw.start();
    };

    return herkenning;
  }

  function startOpnemen() {
    if (!haalSpeechRecognition()) return;

    basisTekstRef.current = waarde ? `${waarde} ` : '';
    huidigeTekstRef.current = waarde || '';
    luisterenActiefRef.current = true;

    const herkenning = maakHerkenning();
    herkenningRef.current = herkenning;
    herkenning.start();
    setOpnemen(true);
  }

  function stopOpnemen() {
    luisterenActiefRef.current = false;
    herkenningRef.current?.stop();
    setOpnemen(false);
  }

  return { ondersteund, opnemen, startOpnemen, stopOpnemen };
}
