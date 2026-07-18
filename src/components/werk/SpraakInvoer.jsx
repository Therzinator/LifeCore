import { useEffect, useRef, useState } from 'react';
import './SpraakInvoer.css';

function haalSpeechRecognition() {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export default function SpraakInvoer({ waarde, onWaarde, placeholder }) {
  const [opnemen, setOpnemen] = useState(false);
  const herkenningRef = useRef(null);
  const basisTekstRef = useRef('');

  const ondersteund = Boolean(haalSpeechRecognition());

  useEffect(() => () => herkenningRef.current?.stop(), []);

  function startOpnemen() {
    const Herkenning = haalSpeechRecognition();
    if (!Herkenning) return;

    basisTekstRef.current = waarde ? `${waarde}\n` : '';
    const herkenning = new Herkenning();
    herkenning.lang = 'nl-NL';
    herkenning.continuous = true;
    herkenning.interimResults = true;

    herkenning.onresult = (event) => {
      let tekst = '';
      for (let i = 0; i < event.results.length; i++) {
        tekst += event.results[i][0].transcript;
      }
      onWaarde(basisTekstRef.current + tekst);
    };
    herkenning.onerror = () => setOpnemen(false);
    herkenning.onend = () => setOpnemen(false);

    herkenning.start();
    herkenningRef.current = herkenning;
    setOpnemen(true);
  }

  function stopOpnemen() {
    herkenningRef.current?.stop();
    setOpnemen(false);
  }

  return (
    <div className="si-wrap">
      <div className="si-veld-rij">
        <textarea
          className="si-textarea"
          value={waarde}
          onChange={(e) => onWaarde(e.target.value)}
          placeholder={placeholder}
          rows={4}
        />
        {ondersteund && (
          <button
            type="button"
            className={`si-mic-btn ${opnemen ? 'actief' : ''}`}
            onClick={opnemen ? stopOpnemen : startOpnemen}
            aria-label={opnemen ? 'Stop opname' : 'Start spraakinvoer'}
          >
            {opnemen ? '⏹' : '🎤'}
          </button>
        )}
      </div>
      {!ondersteund && <p className="si-hint">Spraakinvoer wordt niet ondersteund in deze browser — typ hierboven.</p>}
      {opnemen && <p className="si-hint">Aan het luisteren... spreek je taken uit, gescheiden door een korte pauze of &quot;en&quot;.</p>}
    </div>
  );
}
