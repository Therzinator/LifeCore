import { useCallback, useEffect, useRef } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

// Hoe vaak we — terwijl de app open staat — actief bij de server checken of
// er een nieuwe service worker klaarstaat. De browser doet dit vanzelf ook
// af en toe, maar dat is te traag om op te vertrouwen tijdens het testen van
// een net gedeployde versie.
const CONTROLE_INTERVAL_MS = 10 * 60 * 1000;

export function useAppUpdate() {
  const registratieRef = useRef(null);

  const {
    needRefresh: [nieuweVersieBeschikbaar, setNieuweVersieBeschikbaar],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swScriptUrl, registration) {
      registratieRef.current = registration ?? null;
    },
  });

  useEffect(() => {
    function controleer() {
      registratieRef.current?.update();
    }
    const intervalId = setInterval(controleer, CONTROLE_INTERVAL_MS);

    function opZichtbaarheidWissel() {
      if (document.visibilityState === 'visible') controleer();
    }
    document.addEventListener('visibilitychange', opZichtbaarheidWissel);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', opZichtbaarheidWissel);
    };
  }, []);

  const bijwerken = useCallback(() => {
    updateServiceWorker(true);
  }, [updateServiceWorker]);

  const negeren = useCallback(() => setNieuweVersieBeschikbaar(false), [setNieuweVersieBeschikbaar]);

  return { nieuweVersieBeschikbaar, bijwerken, negeren };
}
