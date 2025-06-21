import { sveltekit } from '@sveltejs/kit/vite';
import devtoolsJson from 'vite-plugin-devtools-json';
import fs from 'fs';
import path from 'path';

const SSL_DIR = '/volume2/video/Projects/SSL';

// Function to check if SSL certificates exist
function getSSLConfig() {
  try {
    const keyPath = path.join(SSL_DIR, 'privkey.pem');
    const certPath = path.join(SSL_DIR, 'fullchain.pem');
    
    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
      return {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath)
      };
    }
  } catch (error) {
    console.log('SSL certificates not found or not accessible:', error.message);
  }
  return null;
}

const sslConfig = getSSLConfig();

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [
    sveltekit(),
    devtoolsJson()
  ],

  server: {
    host: '0.0.0.0',
    port: 5173,
    ...(sslConfig && { https: sslConfig }),
    hmr: {
      host: 'amirnas.dynamic-dns.net',
      port: 5173,
      ...(sslConfig && { protocol: 'wss' })  // Use secure WebSocket if HTTPS
    }
  },

  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: true,
    allowedHosts: ['iamhereapp.synology.me', 'amirnas.dynamic-dns.net'],
    ...(sslConfig && { https: sslConfig })
  }
};

export default config;
