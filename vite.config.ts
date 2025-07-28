import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Configuración para habilitar el React Compiler
      babel: {
        plugins: [
          ["babel-plugin-react-compiler", {}],
        ],
      },
    }),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      workbox: {},
      manifest: {
        theme_color: '#ffffff',
        background_color: '#f1f5f9',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        name: 'Control de Cosecha',
        short_name: 'Cosecha',
        description: 'Aplicación PWA para el control de cosecha offline-first.',
        icons: [
          {
            src: 'harvester-s.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'harvester.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })],
})
