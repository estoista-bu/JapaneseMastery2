#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔐 Generating long-term SSL certificate...\n');

// Check if OpenSSL is available
try {
  execSync('openssl version', { stdio: 'ignore' });
  console.log('✅ OpenSSL is available');
} catch (error) {
  console.log('❌ OpenSSL is not available');
  console.log('📋 To install OpenSSL:');
  console.log('  Windows: Download from https://slproweb.com/products/Win32OpenSSL.html');
  console.log('  macOS: brew install openssl');
  console.log('  Linux: sudo apt install openssl');
  process.exit(1);
}

// Create certificates directory
const certsDir = path.join(__dirname, '.certificates');
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir);
}

// Create OpenSSL config file
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
CN = 192.168.1.200

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = 127.0.0.1
IP.1 = 127.0.0.1
IP.2 = ::1
IP.3 = 192.168.1.200
IP.4 = 0.0.0.0
`;

fs.writeFileSync(path.join(certsDir, 'openssl.conf'), opensslConfig);

try {
  console.log('🔑 Generating private key...');
  execSync(`openssl genrsa -out ${path.join(certsDir, 'long-term-key.pem')} 2048`, { stdio: 'inherit' });
  
  console.log('🔑 Generating certificate with 10-year expiration...');
  execSync(`openssl req -new -x509 -key ${path.join(certsDir, 'long-term-key.pem')} -out ${path.join(certsDir, 'long-term.pem')} -days 3650 -config ${path.join(certsDir, 'openssl.conf')}`, { stdio: 'inherit' });
  
  console.log('✅ Long-term SSL certificates generated successfully!');
  console.log('📅 Certificate expires in 10 years (3650 days)');
  console.log(`🌐 Your app will be accessible at: https://192.168.1.200:3000`);
  console.log(`🔗 API will be accessible at: https://192.168.1.200:8443/api`);
  
  // Clean up config file
  fs.unlinkSync(path.join(certsDir, 'openssl.conf'));
  
} catch (error) {
  console.log('❌ Failed to generate certificates:', error.message);
  process.exit(1);
}

console.log('\n🚀 Long-term HTTPS setup complete!');
console.log('📝 To use these certificates, update your HTTPS server to use:');
console.log('   - Certificate: .certificates/long-term.pem');
console.log('   - Key: .certificates/long-term-key.pem'); 