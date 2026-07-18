import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      workbox: { clientsClaim: true },
      manifest: {
        name: 'LifeCore',
        short_name: 'LifeCore',
        description: 'Persoonlijke welzijns- en levensmanagement-app',
        theme_color: '#5B7A66',
        background_color: '#FAF7F2',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
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
