#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔐 Setting up HTTPS for development...\n');

// Check if mkcert is installed
try {
  execSync('mkcert --version', { stdio: 'ignore' });
  console.log('✅ mkcert is already installed');
} catch (error) {
  console.log('❌ mkcert is not installed');
  console.log('\n📋 To install mkcert:');
  console.log('  Windows (with Chocolatey): choco install mkcert');
  console.log('  Windows (with Scoop): scoop install mkcert');
  console.log('  macOS: brew install mkcert');
  console.log('  Linux: sudo apt install mkcert');
  console.log('\nAfter installing mkcert, run this script again.');
  process.exit(1);
}

// Create certificates directory
const certsDir = path.join(__dirname, '.certificates');
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir);
}

// Generate certificates
try {
  console.log('🔑 Generating SSL certificates...');
  execSync(`mkcert -key-file ${path.join(certsDir, 'localhost-key.pem')} -cert-file ${path.join(certsDir, 'localhost.pem')} localhost 127.0.0.1 ::1`, { stdio: 'inherit' });
  console.log('✅ SSL certificates generated successfully!');
} catch (error) {
  console.log('❌ Failed to generate certificates');
  process.exit(1);
}

console.log('\n🚀 HTTPS setup complete!');
console.log('📝 To start the development server with HTTPS:');
console.log('   npm run dev:https');
console.log('\n🌐 Your app will be available at: https://localhost:3000'); 