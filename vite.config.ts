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
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg', 'logo.png'],
      workbox: {},
      manifest: {
        name: "Hallmay Harvest App",
        short_name: "Hallmay",
        description: "Aplicación de gestión de cosecha",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#2A6449",
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
