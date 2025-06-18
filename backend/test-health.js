#!/usr/bin/env node

const http = require('http');
const https = require('https');
const config = require('./config');

// Use the actual IP address instead of 0.0.0.0
const BACKEND_IP = '192.168.1.17';
const BACKEND_URL = `${config.HTTPS.enabled ? 'https' : 'http'}://${BACKEND_IP}:${config.PORT}`;

console.log('🏥 Testing Health Endpoint with Units');
console.log('=' .repeat(50));
console.log(`URL: ${BACKEND_URL}`);
console.log('');

// Configure HTTPS to accept self-signed certificates
const httpsAgent = new https.Agent({
  rejectUnauthorized: false // Accept self-signed certificates
});

function testHealth() {
  const protocol = config.HTTPS.enabled ? https : http;
  
  const options = config.HTTPS.enabled ? {
    hostname: BACKEND_IP,
    port: config.PORT,
    path: '/health',
    method: 'GET',
    agent: httpsAgent
  } : {
    hostname: BACKEND_IP,
    port: config.PORT,
    path: '/health',
    method: 'GET'
  };
  
  const req = protocol.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const health = JSON.parse(data);
        
        console.log('✅ Health Check Results:');
        console.log('');
        
        console.log('📊 Server Status:');
        console.log(`   Status: ${health.status}`);
        console.log(`   Timestamp: ${health.timestamp}`);
        console.log('');
        
        console.log('⏱️  Uptime:');
        console.log(`   Raw: ${health.uptime.seconds} seconds`);
        console.log(`   Formatted: ${health.uptime.formatted}`);
        console.log('');
        
        console.log('🧠 Memory Usage:');
        console.log(`   RSS: ${health.memory.rss.mb}MB (${health.memory.rss.bytes} bytes)`);
        console.log(`   Heap Used: ${health.memory.heapUsed.mb}MB (${health.memory.heapUsed.bytes} bytes)`);
        console.log(`   Heap Total: ${health.memory.heapTotal.mb}MB (${health.memory.heapTotal.bytes} bytes)`);
        console.log('');
        
        console.log('🔌 WebSocket Connections:');
        console.log(`   Active: ${health.websocketConnections}`);
        console.log('');
        
        console.log('📝 Log File:');
        console.log(`   File: ${health.logFile.path}`);
        console.log(`   Size: ${health.logFile.size.kb}KB (${health.logFile.size.bytes} bytes)`);
        console.log('');
        
        console.log('📋 Memory Types Explained:');
        console.log('   • RSS: Total memory allocated to the process');
        console.log('   • Heap Used: JavaScript objects currently in memory');
        console.log('   • Heap Total: Total JavaScript heap space reserved');
        console.log('');
        
        console.log('💡 What to Watch For:');
        console.log('   • High RSS (>100MB): Process using too much memory');
        console.log('   • High Heap Used: Memory leak in JavaScript code');
        console.log('   • Large Log File (>10MB): Too much logging');
        console.log('   • Zero Uptime: Server just restarted');
        
      } catch (error) {
        console.error('❌ Failed to parse health response:', error.message);
        console.log('Raw response:', data);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ Health check failed:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('   1. Is the backend running? (npm run dev)');
    console.log('   2. Try: curl -k https://192.168.1.17:3001/health');
  });
  
  req.setTimeout(5000, () => {
    console.error('❌ Health check timeout (5 seconds)');
    req.destroy();
  });
  
  req.end();
}

// Run the test
testHealth(); 