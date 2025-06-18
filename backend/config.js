module.exports = {
    HOST: '0.0.0.0',        // Accept connections from any IP (good for LAN/NAS)
    PORT: 3001,
    BACKEND_NAME: 'IamHereApp Server',
    // HTTPS configuration for better PWA compatibility
    HTTPS: {
      enabled: true, // Set to true if you have SSL certificates
      key: './ssl/private.key',
      cert: './ssl/certificate.crt'
    },
    // Global access configuration
    GLOBAL_ACCESS: {
      enabled: process.env.GLOBAL_ACCESS === 'true',
      domain: process.env.GLOBAL_DOMAIN || 'iamhere.duckdns.org',
      ssl: process.env.GLOBAL_SSL === 'true'
    }
    // Add DB paths, CORS settings, or WebSocket options here
  };
  