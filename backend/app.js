require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const net = require('net');

const { PORT, HOST, BACKEND_NAME, HTTPS } = require('./config');
const { getFrontendUrls, getServerUrl } = require('./constants');
const apiRoutes = require('./routes/api');
const userRoutes = require('./routes/user');
const websocketHandler = require('./routes/websocket');
const logger = require('./utils/logger');

// Function to check if port is available
function checkPortAvailable(port, host = '0.0.0.0') {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    
    server.listen(port, host, () => {
      server.once('close', () => {
        resolve(true);
      });
      server.close();
    });
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        reject(err);
      }
    });
  });
}

// Function to find and kill process using port
async function findAndKillProcessOnPort(port) {
  const { execSync } = require('child_process');
  try {
    // Use netstat to find the process using the port
    const netstatCmd = `sudo netstat -tlnp | grep :${port}`;
    const result = execSync(netstatCmd, { encoding: 'utf8' });
    
    if (result.trim()) {
      // Parse the netstat output to extract PID
      // Format: tcp        0      0 0.0.0.0:3001            0.0.0.0:*               LISTEN      17763/node
      const lines = result.trim().split('\n');
      const pidsKilled = [];
      
      for (const line of lines) {
        const match = line.match(/LISTEN\s+(\d+)\//);
        if (match) {
          const pid = match[1];
          logger.info('Found process using port', {
            port: port,
            pid: pid,
            processLine: line.trim()
          });
          
          // Kill the process
          try {
            execSync(`sudo kill -9 ${pid}`, { encoding: 'utf8' });
            pidsKilled.push(pid);
            logger.success('Successfully killed process', {
              port: port,
              pid: pid
            });
          } catch (killError) {
            logger.error('Failed to kill process', {
              port: port,
              pid: pid,
              error: killError.message
            });
            throw killError;
          }
        }
      }
      
      if (pidsKilled.length > 0) {
        // Wait a moment for processes to fully terminate
        await new Promise(resolve => setTimeout(resolve, 1000));
        logger.info('Port cleanup completed', {
          port: port,
          killedProcesses: pidsKilled
        });
      }
      
      return pidsKilled;
    } else {
      logger.info('No process found using port', { port: port });
      return [];
    }
  } catch (error) {
    if (error.message.includes('Command failed')) {
      // netstat found nothing, which is good
      logger.info('No process found using port', { port: port });
      return [];
    }
    logger.error('Error checking/killing process on port', {
      port: port,
      error: error.message
    });
    throw error;
  }
}

// Check port availability and clean up if needed
async function checkPortBeforeStart() {
  logger.info('Checking port availability', { port: PORT, host: HOST });
  
  const isAvailable = await checkPortAvailable(PORT, HOST);
  
  if (!isAvailable) {
    logger.warning('Port is in use, attempting to clean up', {
      port: PORT,
      host: HOST
    });
    
    try {
      // Find and kill processes using the port
      const killedPids = await findAndKillProcessOnPort(PORT);
      
      if (killedPids.length > 0) {
        // Check if port is now available
        const isNowAvailable = await checkPortAvailable(PORT, HOST);
        if (isNowAvailable) {
          logger.success('Port is now available after cleanup', {
            port: PORT,
            killedProcesses: killedPids
          });
        } else {
          logger.error('Port still not available after cleanup', {
            port: PORT,
            killedProcesses: killedPids
          });
          process.exit(1);
        }
      } else {
        logger.error('Port is in use but no process found to kill', {
          port: PORT,
          suggestion: 'Another service may be using this port'
        });
        process.exit(1);
      }
    } catch (error) {
      logger.fatal('Failed to clean up port', {
        port: PORT,
        error: error.message,
        suggestion: 'You may need to manually kill the process or change the port'
      });
      process.exit(1);
    }
  } else {
    logger.success('Port is available', { port: PORT, host: HOST });
  }
}

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
    // Always use the absolute paths from config
    const keyPath = HTTPS.key;
    const certPath = HTTPS.cert;
    
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
  const userAgent = req.get('User-Agent');
  const origin = req.get('Origin');
  
  // Log incoming connections
  logger.info('Incoming connection', {
    origin: origin || 'Direct',
    userAgent: userAgent,
    ip: req.ip || req.connection.remoteAddress,
    path: req.path,
    method: req.method
  });
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.request(
      req.method, 
      req.path, 
      res.statusCode, 
      duration, 
      req.ip || req.connection.remoteAddress,
      userAgent
    );
  });
  
  next();
});

// ✅ MIDDLEWARE — MUST COME FIRST
app.use(cors({
  origin: [
    ...getFrontendUrls(true), // Get all frontend URLs with HTTPS
    getServerUrl(true), // Get server URL with HTTPS
    getServerUrl(false) // Get server URL with HTTP for fallback
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
async function startServer() {
  // Check port availability first
  await checkPortBeforeStart();
  
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
}

// Start the server
startServer().catch((error) => {
  logger.fatal('Failed to start server', {
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
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
