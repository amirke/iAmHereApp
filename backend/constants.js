// Shared constants for IamHereApp
// This file contains all the constants that should be consistent across the application

// Server Configuration
const SERVER_PORT = 3001;
const SERVER_HOST = '0.0.0.0';
const SERVER_NAME = 'IamHereApp Server';

// Domain Configuration
const DOMAIN_NAME = 'amirnas.dynamic-dns.net';
const LOCAL_IP = '192.168.1.17';

// Frontend Ports
const FRONTEND_DEV_PORT = 5173;
const FRONTEND_PROD_PORT = 4173;

// SSL/TLS Configuration
const SSL_KEY_PATH = '/volume2/video/Projects/SSL/privkey.pem';
const SSL_CERT_PATH = '/volume2/video/Projects/SSL/fullchain.pem';

// Database Configuration
const DB_PATH = './db/arrived.db';
const DB_SCHEMA_PATH = './db/schema.sql';

// WebSocket Configuration
const WS_HEARTBEAT_INTERVAL = 30000; // 30 seconds

// Application Configuration
const APP_VERSION = '1.0.0';
const BUILD_NUMBER = 1;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// Network Configuration
const NETWORK_TIMEOUT = 10000; // 10 seconds
const NETWORK_RETRIES = 3;
const NETWORK_RETRY_DELAY = 1000; // 1 second

// Export all constants
module.exports = {
  // Server
  SERVER_PORT,
  SERVER_HOST,
  SERVER_NAME,
  
  // Domain
  DOMAIN_NAME,
  LOCAL_IP,
  
  // Frontend
  FRONTEND_DEV_PORT,
  FRONTEND_PROD_PORT,
  
  // SSL
  SSL_KEY_PATH,
  SSL_CERT_PATH,
  
  // Database
  DB_PATH,
  DB_SCHEMA_PATH,
  
  // WebSocket
  WS_HEARTBEAT_INTERVAL,
  
  // Application
  APP_VERSION,
  BUILD_NUMBER,
  JWT_SECRET,
  
  // Network
  NETWORK_TIMEOUT,
  NETWORK_RETRIES,
  NETWORK_RETRY_DELAY,
  
  // Helper functions
  getServerUrl: (useHttps = true) => {
    const protocol = useHttps ? 'https' : 'http';
    return `${protocol}://${DOMAIN_NAME}:${SERVER_PORT}`;
  },
  
  getLocalServerUrl: (useHttps = true) => {
    const protocol = useHttps ? 'https' : 'http';
    return `${protocol}://${LOCAL_IP}:${SERVER_PORT}`;
  },
  
  getFrontendUrls: (useHttps = true) => {
    const protocol = useHttps ? 'https' : 'http';
    return [
      `${protocol}://${LOCAL_IP}:${FRONTEND_DEV_PORT}`,
      `${protocol}://${LOCAL_IP}:${FRONTEND_PROD_PORT}`,
      `${protocol}://${DOMAIN_NAME}:${FRONTEND_DEV_PORT}`,
      `${protocol}://${DOMAIN_NAME}:${FRONTEND_PROD_PORT}`
    ];
  }
}; 