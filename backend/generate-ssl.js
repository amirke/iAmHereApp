const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔐 Generating self-signed SSL certificates for development...');

const sslDir = path.join(__dirname, 'ssl');
const keyPath = path.join(sslDir, 'private.key');
const certPath = path.join(sslDir, 'certificate.crt');

// Check if OpenSSL is available
try {
  execSync('openssl version', { stdio: 'pipe' });
} catch (error) {
  console.error('❌ OpenSSL not found. Please install OpenSSL first.');
  console.log('📥 Download from: https://slproweb.com/products/Win32OpenSSL.html');
  process.exit(1);
}

// Generate private key
console.log('📝 Generating private key...');
execSync(`openssl genrsa -out "${keyPath}" 2048`, { stdio: 'inherit' });

// Generate certificate
console.log('📜 Generating certificate...');
const opensslConfig = `
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = US
ST = State
L = City
O = Organization
OU = Organizational Unit
CN = localhost

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = 192.168.1.17
IP.1 = 127.0.0.1
IP.2 = 192.168.1.17
`;

const configPath = path.join(sslDir, 'openssl.conf');
fs.writeFileSync(configPath, opensslConfig);

execSync(`openssl req -new -x509 -key "${keyPath}" -out "${certPath}" -days 365 -config "${configPath}"`, { stdio: 'inherit' });

// Clean up config file
fs.unlinkSync(configPath);

console.log('✅ SSL certificates generated successfully!');
console.log(`🔑 Private key: ${keyPath}`);
console.log(`📜 Certificate: ${certPath}`);
console.log('');
console.log('⚠️  IMPORTANT: These are self-signed certificates for development only.');
console.log('   Your browser will show a security warning - this is normal.');
console.log('   Click "Advanced" and "Proceed to localhost (unsafe)" to continue.');
console.log('');
console.log('🚀 To enable HTTPS, set HTTPS.enabled = true in config.js'); 