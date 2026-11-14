/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      workbox: { globPatterns: ['**/*.{js,css,html,svg,woff2}'] },
      manifest: {
        name: 'OUTPOST — Junior Astronaut Mission Trainer',
        short_name: 'OUTPOST',
        description: 'Run a Moon or Mars base. Split limited power across life support, shielding, food and science. Real NASA data.',
        theme_color: '#2D5BFF',
        background_color: '#F4F6FC',
        display: 'standalone',
        icons: [{ src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: { charts: ['recharts'] },
      },
    },
  },
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});
