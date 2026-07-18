import { useEffect, useRef, useState } from 'react';
import './InstallBanner.css';

const OPGESLAGEN_KEY = 'lifecore_installbanner_verborgen';

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

// Suggereert de app te installeren wanneer die in een gewone browsertab
// draait i.p.v. als geïnstalleerde PWA. Gebruikt het native install-prompt-
// event waar beschikbaar (Android/Chrome); iOS Safari kent dat event niet,
// dus daar tonen we na een korte vertraging alsnog de banner met
// handmatige "Zet op beginscherm"-instructies.
export default function InstallBanner() {
  const [zichtbaar, setZichtbaar] = useState(false);
  const [heeftPrompt, setHeeftPrompt] = useState(false);
  const promptEventRef = useRef(null);

  useEffect(() => {
    if (isStandalone() || localStorage.getItem(OPGESLAGEN_KEY)) return undefined;

    function opBeforeInstall(e) {
      e.preventDefault();
      promptEventRef.current = e;
      setHeeftPrompt(true);
      setZichtbaar(true);
    }
    window.addEventListener('beforeinstallprompt', opBeforeInstall);

    const timer = setTimeout(() => {
      if (!promptEventRef.current && !isStandalone() && !localStorage.getItem(OPGESLAGEN_KEY)) {
        setZichtbaar(true);
      }
    }, 2000);

    return () => {
      window.removeEventListener('beforeinstallprompt', opBeforeInstall);
      clearTimeout(timer);
    };
  }, []);

  async function installeren() {
    if (!promptEventRef.current) return;
    promptEventRef.current.prompt();
    const { outcome } = await promptEventRef.current.userChoice;
    if (outcome === 'accepted') sluiten();
  }

  function sluiten() {
    localStorage.setItem(OPGESLAGEN_KEY, '1');
    setZichtbaar(false);
  }

  if (!zichtbaar) return null;

  return (
    <div className="ib-wrap" role="status">
      <span className="ib-tekst">
        {heeftPrompt
          ? '📲 Installeer LifeCore als app — ook offline beschikbaar.'
          : '📲 Zet LifeCore op je beginscherm: tik op delen en kies "Zet op beginscherm".'}
      </span>
      <div className="ib-acties">
        {heeftPrompt && (
          <button type="button" className="ib-btn" onClick={installeren}>Installeren</button>
        )}
        <button type="button" className="ib-negeer-btn" onClick={sluiten} aria-label="Sluiten">✕</button>
      </div>
    </div>
  );
}
