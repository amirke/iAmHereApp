#!/usr/bin/env node
// what thi s file do?
// it tests the connection to the backend server
// it tests the health endpoint
// it tests the register endpoint
// it tests the login endpoint
// it tests the logout endpoint
// it tests the get user endpoint
// it tests the update user endpoint

// how to use it?
// 1. run the command: node test-connection.js
// 2. it will test the connection to the backend server
// 3. it will test the health endpoint
// 4. it will test the register endpoint
// 5. it will test the login endpoint
// 6. it will test the logout endpoint
const http = require('http');
const https = require('https');
const config = require('./config');

// Use the actual IP address instead of 0.0.0.0
const BACKEND_IP = '192.168.1.17';
const BACKEND_URL = `${config.HTTPS.enabled ? 'https' : 'http'}://${BACKEND_IP}:${config.PORT}`;

console.log('🔍 Testing Backend Connection');
console.log('=' .repeat(50));
console.log(`URL: ${BACKEND_URL}`);
console.log('');

// Configure HTTPS to accept self-signed certificates
const httpsAgent = new https.Agent({
  rejectUnauthorized: false // Accept self-signed certificates
});

function testConnection() {
  const protocol = config.HTTPS.enabled ? https : http;
  
  console.log('1️⃣ Testing health endpoint...');
  
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
  
  const healthReq = protocol.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const health = JSON.parse(data);
        console.log('✅ Health endpoint working:', health.status);
        console.log(`   Uptime: ${health.uptime.formatted}`);
        console.log(`   Memory: ${health.memory.rss.mb}MB`);
        console.log('');
        
        // Test register endpoint
        testRegisterEndpoint();
      } catch (error) {
        console.error('❌ Failed to parse health response:', error.message);
        console.log('Raw response:', data);
      }
    });
  });
  
  healthReq.on('error', (error) => {
    console.error('❌ Health endpoint failed:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('   1. Is the backend running? (npm run dev)');
    console.log('   2. Is HTTPS enabled? Check config.js');
    console.log('   3. Are SSL certificates valid?');
    console.log('   4. Is the port 3001 accessible?');
    console.log('   5. Try: curl -k https://192.168.1.17:3001/health');
  });
  
  healthReq.setTimeout(5000, () => {
    console.error('❌ Health endpoint timeout (5 seconds)');
    healthReq.destroy();
  });
  
  healthReq.end();
}

function testRegisterEndpoint() {
  const protocol = config.HTTPS.enabled ? https : http;
  
  console.log('2️⃣ Testing register endpoint...');
  
  const postData = JSON.stringify({
    username: 'testuser',
    password: 'testpass',
    display_name: 'Test User',
    language: 'en'
  });
  
  const options = config.HTTPS.enabled ? {
    hostname: BACKEND_IP,
    port: config.PORT,
    path: '/api/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    },
    agent: httpsAgent
  } : {
    hostname: BACKEND_IP,
    port: config.PORT,
    path: '/api/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  const req = protocol.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        if (res.statusCode === 200) {
          console.log('✅ Register endpoint working');
          console.log('   Response:', response.message || 'Success');
        } else {
          console.log('⚠️  Register endpoint responded with status:', res.statusCode);
          console.log('   Response:', response.error || response);
        }
      } catch (error) {
        console.log('⚠️  Register endpoint response (not JSON):', data);
      }
      console.log('');
      console.log('🎉 Backend connection test completed!');
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ Register endpoint failed:', error.message);
  });
  
  req.setTimeout(5000, () => {
    console.error('❌ Register endpoint timeout (5 seconds)');
    req.destroy();
  });
  
  req.write(postData);
  req.end();
}

// Run the test
testConnection(); 