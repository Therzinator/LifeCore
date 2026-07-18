import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      // We registreren de service worker zelf via virtual:pwa-register/react
      // (useAppUpdate-hook) zodat we een update-banner kunnen tonen — de
      // standaard geïnjecteerde registerSW.js doet dat niet en laat een
      // nieuwe versie stil in de 'waiting'-status hangen.
      injectRegister: false,
      workbox: { clientsClaim: true },
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
