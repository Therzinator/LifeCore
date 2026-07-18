import { execSync } from 'node:child_process';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Build-identifier voor de versie-weergave onder het instellingen-tandwiel.
// package.json's versienummer wordt in dit project nooit bijgewerkt, dus
// daar kun je niet aan zien of een nieuwe deploy live staat — de commit-
// hash verandert wél bij elke deploy. VERCEL_GIT_COMMIT_SHA is beschikbaar
// tijdens elke Vercel-build; lokaal valt dit terug op git zelf.
function haalBuildVersie() {
  if (process.env.VERCEL_GIT_COMMIT_SHA) return process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7);
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'dev';
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
        // De WASM-runtime van onnxruntime-web (Whisper-inference) is ~23MB —
        // die moet niet standaard bij installatie geprecached worden (zou de
        // eerste app-install onnodig zwaar maken voor wie nooit spraakinvoer
        // gebruikt). In plaats daarvan cachen we 'm lazily via runtimeCaching
        // zodra iemand de mic daadwerkelijk voor het eerst gebruikt.
        globIgnores: ['**/whisperWorker-*.js', '**/*.wasm'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.endsWith('.wasm') || url.pathname.includes('whisperWorker'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'lifecore-whisper-runtime',
              expiration: { maxEntries: 10, maxAgeSeconds: 180 * 24 * 60 * 60 },
            },
          },
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
