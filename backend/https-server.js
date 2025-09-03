import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check for long-term certificates first, then fallback to others
const longTermCertPath = path.join(__dirname, '../.certificates/long-term.pem');
const longTermKeyPath = path.join(__dirname, '../.certificates/long-term-key.pem');
const networkCertPath = path.join(__dirname, '../.certificates/network.pem');
const networkKeyPath = path.join(__dirname, '../.certificates/network-key.pem');
const localhostCertPath = path.join(__dirname, '../.certificates/localhost.pem');
const localhostKeyPath = path.join(__dirname, '../.certificates/localhost-key.pem');

let certPath, keyPath;

if (fs.existsSync(longTermCertPath) && fs.existsSync(longTermKeyPath)) {
  certPath = longTermCertPath;
  keyPath = longTermKeyPath;
  console.log('🔐 Using long-term SSL certificates (10-year expiration)');
} else if (fs.existsSync(networkCertPath) && fs.existsSync(networkKeyPath)) {
  certPath = networkCertPath;
  keyPath = networkKeyPath;
  console.log('🔐 Using network SSL certificates');
} else if (fs.existsSync(localhostCertPath) && fs.existsSync(localhostKeyPath)) {
  certPath = localhostCertPath;
  keyPath = localhostKeyPath;
  console.log('🔐 Using localhost SSL certificates');
} else {
  console.log('❌ SSL certificates not found!');
  console.log('📝 Please run "node generate-long-cert.js" from the project root first.');
  process.exit(1);
}

const options = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath)
};

// Create HTTPS server
const server = https.createServer(options, (req, res) => {
  // Forward request to Laravel
  const laravelReq = http.request({
    hostname: '127.0.0.1',
    port: 8000,
    path: req.url,
    method: req.method,
    headers: req.headers
  }, (laravelRes) => {
    res.writeHead(laravelRes.statusCode, laravelRes.headers);
    laravelRes.pipe(res);
  });

  req.pipe(laravelReq);
});

const PORT = 8443;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Laravel HTTPS server running on https://192.168.1.200:${PORT}`);
  console.log(`📝 Make sure Laravel is running on http://127.0.0.1:8000`);
  console.log(`🔗 API endpoints will be available at https://192.168.1.200:${PORT}/api`);
  console.log(`🌐 Network accessible at https://192.168.1.200:${PORT}`);
});

server.on('error', (err) => {
  console.error('❌ HTTPS server error:', err);
}); 