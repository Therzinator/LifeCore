import { clientsClaim } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// self.__WB_MANIFEST wordt door vite-plugin-pwa (injectManifest-strategie)
// tijdens de build vervangen door de lijst gehashte build-assets — dat geeft
// dezelfde precache als voorheen de generateSW-strategie deed, alleen kunnen
// we in dit bestand nu ook eigen event-listeners toevoegen (zie
// notificationclick hieronder, de reden voor deze overstap).
precacheAndRoute(self.__WB_MANIFEST);

// Zelfde runtimeCaching-regel als voorheen in vite.config.js (workbox.
// runtimeCaching) — oefening-afbeeldingen (Free Exercise DB) na de eerste
// keer bekijken ook offline beschikbaar, i.p.v. elke keer opnieuw ophalen.
registerRoute(
  ({ url }) => url.hostname === 'raw.githubusercontent.com',
  new CacheFirst({
    cacheName: 'lifecore-oefening-afbeeldingen',
    plugins: [new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 180 * 24 * 60 * 60 })],
  }),
);

// GEEN onvoorwaardelijke self.skipWaiting() hier — dat zou een nieuwe versie
// meteen activeren zodra 'm klaarstaat, wat de bestaande 'vraag eerst'-UX
// (registerType: 'prompt' in vite.config.js, de UpdateBanner in App.jsx)
// omzeilt. useAppUpdate.js stuurt pas een SKIP_WAITING-bericht als de
// gebruiker zelf op 'Bijwerken' tikt (via updateServiceWorker(true) uit
// virtual:pwa-register/react) — pas dán activeert de nieuwe service worker.
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
clientsClaim();

// Zonder deze listener blijft een systeemnotificatie (zie useRustTimer.js
// toonEindNotificatie) na een tik gewoon in de meldingenbalk hangen — er is
// dan geen default-actie die 'm sluit en de app naar de voorgrond haalt.
// notification.close() ruimt de melding zelf op; de client-matchAll-stap
// hergebruikt een al-open tabblad/PWA-venster i.p.v. altijd een nieuwe te
// openen.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      return self.clients.openWindow ? self.clients.openWindow('/') : undefined;
    }),
  );
});
