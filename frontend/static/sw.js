// Simple Service Worker for IamHereApp PWA
const CACHE_VERSION = 'v1.0.2-3';
const APP_VERSION = '1.0.2';
const CACHE_NAME = 'iamhere-v1';
const urlsToCache = [
  '/',
  '/manifest.webmanifest',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/favicon.png'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker installed');
        return self.skipWaiting();
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Message event - for emergency cache clearing
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_ALL_CACHES') {
    console.log('🧹 Emergency cache clear requested');
    event.waitUntil(
      clearAllCaches().then(() => {
        // Notify the client that clearing is complete
        event.ports[0].postMessage({ success: true });
      }).catch((error) => {
        console.error('Cache clearing failed:', error);
        event.ports[0].postMessage({ success: false, error: error.message });
      })
    );
  }
});

// Emergency cache clearing function
async function clearAllCaches() {
  console.log('🧹 Starting emergency cache clear...');
  
  // 1. Get all cache names
  const cacheNames = await caches.keys();
  console.log(`Found ${cacheNames.length} caches to delete:`, cacheNames);
  
  // 2. Delete all caches
  const deletePromises = cacheNames.map(cacheName => {
    console.log(`Deleting cache: ${cacheName}`);
    return caches.delete(cacheName);
  });
  
  await Promise.all(deletePromises);
  console.log('✅ All caches cleared');
  
  // 3. Unregister this service worker
  const registration = await self.registration;
  if (registration) {
    console.log('Unregistering service worker...');
    await registration.unregister();
    console.log('✅ Service worker unregistered');
  }
}

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ]).then(() => {
      console.log('Service Worker activated and controlling page');
    })
  );
}); 