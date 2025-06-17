import { sveltekit } from '@sveltejs/kit/vite';
import { VitePWA } from 'vite-plugin-pwa';
import devtoolsJson from 'vite-plugin-devtools-json';

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [
    sveltekit(),
    devtoolsJson(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'IamHereApp',
        short_name: 'IamHere',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],

  server: {
    host: '0.0.0.0'
  },

  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: true,
    allowedHosts: ['iamhereapp.synology.me']
  }
};

export default config;
