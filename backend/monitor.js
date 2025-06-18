#!/usr/bin/env node

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const config = require('./config');
const logger = require('./utils/logger');
const BACKEND_URL = `${config.HTTPS.enabled ? 'https' : 'http'}://${config.HOST}:${config.PORT}`;

// Health check function
function checkBackendHealth() {
  const protocol = config.HTTPS.enabled ? https : http;
  
  const req = protocol.get(`${BACKEND_URL}/health`, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const health = JSON.parse(data);
        logger.info('Backend health check successful', {
          status: health.status,
          uptime: {
            seconds: health.uptime.seconds,
            formatted: health.uptime.formatted
          },
          memory: {
            rss: `${health.memory.rss.mb}MB (${health.memory.rss.bytes} bytes)`,
            heapUsed: `${health.memory.heapUsed.mb}MB (${health.memory.heapUsed.bytes} bytes)`,
            heapTotal: `${health.memory.heapTotal.mb}MB (${health.memory.heapTotal.bytes} bytes)`
          },
          websocketConnections: health.websocketConnections,
          logFile: {
            size: `${health.logFile.size.kb}KB (${health.logFile.size.bytes} bytes)`,
            path: health.logFile.path
          }
        });
      } catch (error) {
        logger.error('Failed to parse health response', {
          error: error.message,
          response: data
        });
      }
    });
  });
  
  req.on('error', (error) => {
    logger.error('Backend health check failed', {
      error: error.message,
      code: error.code,
      url: BACKEND_URL
    });
  });
  
  req.setTimeout(5000, () => {
    logger.error('Backend health check timeout', {
      url: BACKEND_URL,
      timeout: 5000
    });
    req.destroy();
  });
}

// Memory monitoring
function checkMemoryUsage() {
  const memUsage = process.memoryUsage();
  logger.info('Memory usage', {
    rss: `${Math.round(memUsage.rss / 1024 / 1024 * 100) / 100}MB (${memUsage.rss} bytes)`,
    heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100}MB (${memUsage.heapUsed} bytes)`,
    heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024 * 100) / 100}MB (${memUsage.heapTotal} bytes)`
  });
}

// Main monitoring loop
function startMonitoring() {
  logger.logServerEvent('Backend monitoring started', {
    backendUrl: BACKEND_URL,
    checkInterval: 30000 // 30 seconds
  });
  
  // Initial check
  checkBackendHealth();
  
  // Periodic checks
  setInterval(checkBackendHealth, 30000); // Every 30 seconds
  setInterval(checkMemoryUsage, 60000);   // Every minute
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    logger.logServerEvent('Backend monitoring stopped');
    process.exit(0);
  });
}

// Start monitoring if run directly
if (require.main === module) {
  startMonitoring();
}

module.exports = {
  checkBackendHealth,
  checkMemoryUsage,
  startMonitoring
}; 