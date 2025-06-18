require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const { PORT, HOST, BACKEND_NAME, HTTPS } = require('./config');
const apiRoutes = require('./routes/api');
const userRoutes = require('./routes/user');
const websocketHandler = require('./routes/websocket');
const logger = require('./utils/logger');

// Process monitoring with file logging
process.on('uncaughtException', (error) => {
  logger.fatal('Uncaught Exception - Server will restart', {
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', {
    reason: reason,
    promise: promise
  });
});

process.on('SIGTERM', () => {
  logger.logServerEvent('SIGTERM received - Graceful shutdown');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.logServerEvent('SIGINT received - Graceful shutdown');
  process.exit(0);
});

// Log server startup
logger.logServerEvent('Backend Server Starting', {
  nodeVersion: process.version,
  platform: process.platform,
  pid: process.pid
});

const app = express();

// Create server based on HTTPS configuration
let server;
if (HTTPS && HTTPS.enabled) {
  try {
    const keyPath = path.join(__dirname, HTTPS.key);
    const certPath = path.join(__dirname, HTTPS.cert);
    
    logger.info('Loading SSL certificates', {
      keyPath: keyPath,
      certPath: certPath
    });
    
    const privateKey = fs.readFileSync(keyPath, 'utf8');
    const certificate = fs.readFileSync(certPath, 'utf8');
    
    const credentials = { key: privateKey, cert: certificate };
    server = https.createServer(credentials, app);
    
    logger.success('HTTPS server enabled');
  } catch (error) {
    logger.error('Failed to load SSL certificates', {
      error: error.message,
      stack: error.stack
    });
    logger.info('Falling back to HTTP server');
    server = http.createServer(app);
  }
} else {
  server = http.createServer(app);
}

const wss = new WebSocket.Server({ server });

// WebSocket connection monitoring
wss.on('connection', (ws, req) => {
  const clientIP = req.socket.remoteAddress;
  logger.websocket('Client connected', {
    ip: clientIP,
    totalConnections: wss.clients.size
  });
  
  ws.on('close', () => {
    logger.websocket('Client disconnected', {
      ip: clientIP,
      totalConnections: wss.clients.size
    });
  });
  
  ws.on('error', (error) => {
    logger.error('WebSocket error', {
      ip: clientIP,
      error: error.message
    });
  });
  
  // Call the actual websocket handler
  websocketHandler(ws, req);
});

// Server error handling
server.on('error', (error) => {
  logger.error('Server error', {
    error: error.message,
    code: error.code,
    stack: error.stack
  });
});

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.request(
      req.method, 
      req.path, 
      res.statusCode, 
      duration, 
      req.ip || req.connection.remoteAddress,
      req.get('User-Agent')
    );
  });
  
  next();
});

// ✅ MIDDLEWARE — MUST COME FIRST
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:4173',
    'http://192.168.1.17:5173',
    'http://192.168.1.17:4173',
    'https://192.168.1.17:5173',
    'https://192.168.1.17:4173',
    // Add your global domain here
    'https://iamhere.duckdns.org',
    'https://iamhere.yourdomain.com',
    // Allow all origins for development (remove in production)
    '*'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Cache-Control', 
    'Pragma', 
    'Expires', 
    'X-App-Version'
  ],
  credentials: true
}));

app.use(helmet());
app.use(express.json());

// ✅ ROUTES
app.use('/api', apiRoutes);
app.use('/api/user', userRoutes);

// ✅ ERROR HANDLER
app.use((err, req, res, next) => {
  logger.error('Express error handler', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  res.status(500).json({ error: 'Something went wrong!' });
});

// ✅ START SERVER
server.listen(PORT, HOST, () => {
  const protocol = HTTPS && HTTPS.enabled ? 'https' : 'http';
  logger.logServerEvent('Backend Server Started Successfully', {
    protocol: protocol,
    host: HOST,
    port: PORT,
    pid: process.pid,
    nodeVersion: process.version,
    memoryUsage: process.memoryUsage(),
    logFile: logger.currentLogFile
  });
});

// Health check endpoint for monitoring
app.get('/health', (req, res) => {
  const memUsage = process.memoryUsage();
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: {
      seconds: process.uptime(),
      formatted: formatUptime(process.uptime())
    },
    memory: {
      rss: {
        bytes: memUsage.rss,
        mb: Math.round(memUsage.rss / 1024 / 1024 * 100) / 100
      },
      heapUsed: {
        bytes: memUsage.heapUsed,
        mb: Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100
      },
      heapTotal: {
        bytes: memUsage.heapTotal,
        mb: Math.round(memUsage.heapTotal / 1024 / 1024 * 100) / 100
      }
    },
    websocketConnections: wss.clients.size,
    logFile: {
      size: {
        bytes: logger.getLogFileSize(),
        kb: Math.round(logger.getLogFileSize() / 1024 * 100) / 100
      },
      path: logger.currentLogFile ? path.basename(logger.currentLogFile) : 'none'
    }
  };
  res.json(health);
});

// Helper function to format uptime
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m ${secs}s`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}
