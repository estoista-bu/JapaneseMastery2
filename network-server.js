const http = require('http');
const { createProxyMiddleware } = require('http-proxy-middleware');
const express = require('express');
const path = require('path');

const app = express();

// Serve static files from Next.js build
app.use(express.static(path.join(__dirname, '.next/static')));
app.use(express.static(path.join(__dirname, 'public')));

// Proxy API requests to Laravel
app.use('/api', createProxyMiddleware({
  target: 'http://127.0.0.1:8000',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api'
  }
}));

// Serve Next.js pages
app.get('*', (req, res) => {
  // For now, redirect to the HTTPS version
  res.redirect(`https://192.168.1.200:3000${req.url}`);
});

const PORT = 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Network HTTP server running on http://192.168.1.200:${PORT}`);
  console.log(`🌐 Access your app at: http://192.168.1.200:${PORT}`);
  console.log(`📝 Make sure Laravel is running on http://127.0.0.1:8000`);
  console.log(`📝 Make sure Next.js is running on https://192.168.1.200:3000`);
}); 