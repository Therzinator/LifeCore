import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Logisch, oplopend versienummer voor de weergave onder het instellingen-
// tandwiel (v1.00 -> v1.01 -> ...) — leesbaar en te volgen, in tegenstelling
// tot een git-commit-hash of Vercel-deploy-ID. Bewust GEEN afgeleide van
// git-commit-aantal: Vercel's build-omgeving doet soms een shallow clone,
// waardoor `git rev-list --count` onbetrouwbaar zou zijn. src/version.json
// wordt bij elke betekenisvolle wijziging handmatig met 1 opgehoogd
// (onderdeel van de commit, zoals het bijwerken van een CHANGELOG).
function haalBuildVersie() {
  const pad = fileURLToPath(new URL('./src/version.json', import.meta.url));
  try {
    const { build } = JSON.parse(readFileSync(pad, 'utf8'));
    return `v1.${String(build).padStart(2, '0')}`;
  } catch {
    return 'v1.00';
  }
}

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(haalBuildVersie()),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      // We registreren de service worker zelf via virtual:pwa-register/react
      // (useAppUpdate-hook) zodat we een update-banner kunnen tonen — de
      // standaard geïnjecteerde registerSW.js doet dat niet en laat een
      // nieuwe versie stil in de 'waiting'-status hangen.
      injectRegister: false,
      workbox: {
        clientsClaim: true,
        runtimeCaching: [
          {
            // Oefening-afbeeldingen (Free Exercise DB) — na de eerste keer
            // bekijken ook offline beschikbaar, i.p.v. elke keer opnieuw op te
            // halen van GitHub.
            urlPattern: ({ url }) => url.hostname === 'raw.githubusercontent.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'lifecore-oefening-afbeeldingen',
              expiration: { maxEntries: 100, maxAgeSeconds: 180 * 24 * 60 * 60 },
            },
          },
        ],
      },
      manifest: {
        name: 'LifeCore',
        short_name: 'LifeCore',
        description: 'Persoonlijke welzijns- en levensmanagement-app',
        // Match het huidige neon-dark-thema (theme.css) — de oude waarden
        // (lichte sage-groene kleuren) hoorden bij een eerder lichte
        // ontwerpfase en gaven een verkeerd gekleurd splashscreen bij het
        // opstarten van de geïnstalleerde app.
        theme_color: '#0A0A0B',
        background_color: '#0A0A0B',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-192-maskable.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  build: {
    sourcemap: true,
  },
  test: {
    environment: 'node',
  },
});
