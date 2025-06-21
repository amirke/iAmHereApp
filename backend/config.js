const { 
  SERVER_PORT, 
  SERVER_HOST, 
  SERVER_NAME, 
  SSL_KEY_PATH, 
  SSL_CERT_PATH 
} = require('./constants');

module.exports = {
    HOST: SERVER_HOST,        // Accept connections from any IP (good for LAN/NAS)
    PORT: SERVER_PORT,
    BACKEND_NAME: SERVER_NAME,
    // HTTPS configuration for better PWA compatibility
    HTTPS: {
      enabled: true, // Set to true if you have SSL certificates
      // Use copied Synology certificates
      key: SSL_KEY_PATH,
      cert: SSL_CERT_PATH
    },
    // Global access configuration
    GLOBAL_ACCESS: {
      enabled: process.env.GLOBAL_ACCESS === 'true',
      domain: process.env.GLOBAL_DOMAIN || 'amirnas.dynamic-dns.net',
      ssl: process.env.GLOBAL_SSL === 'true'
    }
    // Add DB paths, CORS settings, or WebSocket options here
  };
  