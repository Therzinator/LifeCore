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

  // Handmatige noodgreep voor als de gewone update-detectie (needRefresh via
  // Workbox) niet aanslaat — vooral op mobiel bleek dit inconsistent, want
  // die detectie leunt op een wachtende service worker die de browser zelf
  // op zijn eigen moment activeert. In plaats van te vertrouwen op die
  // detectie, verwijderen we de service worker(s) en de cache-storage
  // rechtstreeks en herladen we — daarna kan de browser alleen nog de
  // nieuwste, verse assets ophalen.
  const forceerNieuwsteVersie = useCallback(async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registraties = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registraties.map((r) => r.unregister()));
      }
      if ('caches' in window) {
        const sleutels = await caches.keys();
        await Promise.all(sleutels.map((sleutel) => caches.delete(sleutel)));
      }
    } catch (e) {
      console.error('Kon nieuwste versie niet forceren', e);
    } finally {
      window.location.reload();
    }
  }, []);

  return { nieuweVersieBeschikbaar, bijwerken, negeren, forceerNieuwsteVersie };
}
