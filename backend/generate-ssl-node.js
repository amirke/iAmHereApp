const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🔐 Generating self-signed SSL certificates using Node.js...');

const sslDir = path.join(__dirname, 'ssl');
const keyPath = path.join(sslDir, 'private.key');
const certPath = path.join(sslDir, 'certificate.crt');

// Generate private key
console.log('📝 Generating private key...');
const privateKey = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

fs.writeFileSync(keyPath, privateKey.privateKey);

// Generate self-signed certificate
console.log('📜 Generating certificate...');
const cert = crypto.createCertificate();
cert.setPublicKey(privateKey.publicKey);
cert.sign(privateKey.privateKey, 'sha256');

const certPem = cert.getPEM();
fs.writeFileSync(certPath, certPem);

console.log('✅ SSL certificates generated successfully!');
console.log(`🔑 Private key: ${keyPath}`);
console.log(`📜 Certificate: ${certPath}`);
console.log('');
console.log('⚠️  IMPORTANT: These are self-signed certificates for development only.');
console.log('   Your browser will show a security warning - this is normal.');
console.log('   Click "Advanced" and "Proceed to localhost (unsafe)" to continue.');
console.log('');
console.log('🚀 To enable HTTPS, set HTTPS.enabled = true in config.js'); 