// Import constants - these should match backend constants
const SERVER_PORT = 3001;
const DOMAIN_NAME = 'amirnas.dynamic-dns.net';
const LOCAL_IP = '192.168.1.17';

// Backend server base URL (dynamically constructed)
export const BACKEND_URL = `https://${DOMAIN_NAME}:${SERVER_PORT}`;

// Global access configuration
export const GLOBAL_CONFIG = {
  enabled: true, // Set to true for global access
  domain: DOMAIN_NAME,
  port: SERVER_PORT,
  localIp: LOCAL_IP
};

// Version for cache busting
export const APP_VERSION = '1.0.0';

// Network error handling
export const NETWORK_CONFIG = {
  timeout: 10000, // 10 seconds
  retries: 3,
  retryDelay: 1000 // 1 second
};

// Default headers for API requests
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
  'X-App-Version': APP_VERSION
};

// Helper function to get backend URL based on environment
export function getBackendUrl(useLocal = false) {
  if (useLocal) {
    return `https://${GLOBAL_CONFIG.localIp}:${GLOBAL_CONFIG.port}`;
  }
  if (GLOBAL_CONFIG.enabled) {
    return `https://${GLOBAL_CONFIG.domain}:${GLOBAL_CONFIG.port}`;
  }
  return BACKEND_URL;
}

// Helper function to check if backend is reachable
export async function checkBackendConnection() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), NETWORK_CONFIG.timeout);
    
    const response = await fetch(`${getBackendUrl()}/api/health?v=${APP_VERSION}`, {
      signal: controller.signal,
      headers: DEFAULT_HEADERS
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.warn('Backend connection failed:', error);
    return false;
  }
}

// Helper function to get WebSocket URL
export function getWebSocketUrl() {
  const baseUrl = getBackendUrl();
  return baseUrl.replace('http://', 'ws://').replace('https://', 'wss://');
}
