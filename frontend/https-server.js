import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 4173;

// Basic security headers for PWA
app.use((req, res, next) => {
  // Essential headers for PWA
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});

// Configure proper MIME types and cache headers for SvelteKit
app.use((req, res, next) => {
  // Set correct MIME types for JavaScript modules
  if (req.url.endsWith('.js')) {
    res.setHeader('Content-Type', 'application/javascript');
  } else if (req.url.endsWith('.mjs')) {
    res.setHeader('Content-Type', 'application/javascript');
  } else if (req.url.endsWith('.css')) {
    res.setHeader('Content-Type', 'text/css');
  } else if (req.url.endsWith('.json')) {
    res.setHeader('Content-Type', 'application/json');
  }
  
  // Prevent HTML caching to ensure app.html changes are picked up
  if (req.url.endsWith('.html') || req.url === '/' || !req.url.includes('.')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  next();
});

// Serve static files from static directory (icons, manifest, etc.)
app.use('/static', express.static(path.join(__dirname, 'static')));

// Serve SvelteKit build files with proper MIME types
app.use('/_app', express.static(path.join(__dirname, 'build/_app'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// Serve other build files
app.use(express.static(path.join(__dirname, 'build')));

// PWA specific routes with proper headers
app.get('/manifest.webmanifest', (req, res) => {
  res.setHeader('Content-Type', 'application/manifest+json');
  res.sendFile(path.join(__dirname, 'static', 'manifest.webmanifest'));
});

app.get('/sw.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Service-Worker-Allowed', '/');
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(path.join(__dirname, 'static', 'sw.js'));
});

// Icon files
app.get('/icon-192x192.png', (req, res) => {
  res.setHeader('Content-Type', 'image/png');
  res.sendFile(path.join(__dirname, 'static', 'icons', 'icon-192x192.png'));
});

app.get('/icon-512x512.png', (req, res) => {
  res.setHeader('Content-Type', 'image/png');
  res.sendFile(path.join(__dirname, 'static', 'icons', 'icon-512x512.png'));
});

app.get('/favicon.png', (req, res) => {
  res.setHeader('Content-Type', 'image/png');
  res.sendFile(path.join(__dirname, 'static', 'favicon.png'));
});

// SPA fallback - serve index.html for non-static routes only
app.get('*', (req, res) => {
  // Don't serve index.html for static assets
  if (req.url.includes('/_app/') || 
      req.url.includes('/static/') || 
      req.url.endsWith('.js') || 
      req.url.endsWith('.css') || 
      req.url.endsWith('.json') ||
      req.url.endsWith('.png') ||
      req.url.endsWith('.ico') ||
      req.url.endsWith('.svg')) {
    return res.status(404).send('Not Found');
  }
  
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// SSL configuration
const SSL_DIR = '/volume2/video/Projects/SSL';

let sslOptions;
try {
  sslOptions = {
    key: fs.readFileSync(path.join(SSL_DIR, 'privkey.pem')),
    cert: fs.readFileSync(path.join(SSL_DIR, 'fullchain.pem'))
  };
  console.log('✅ SSL certificates loaded successfully');
} catch (error) {
  console.error('❌ Failed to load SSL certificates:', error.message);
  console.error('Make sure certificates exist at:', SSL_DIR);
  process.exit(1);
}

// Create HTTPS server
const server = https.createServer(sslOptions, app);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 HTTPS PWA Server running on port ${PORT}`);
  console.log(`🌐 External: https://amirnas.dynamic-dns.net:${PORT}`);
  console.log(`🏠 Local: https://192.168.1.17:${PORT}`);
  console.log(`📱 PWA ready - access via domain name for SSL to work`);
  console.log(`🔐 Using SSL certificates from: ${SSL_DIR}`);
});

// Error handling
server.on('error', (error) => {
  console.error('❌ Server error:', error.message);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
}); 