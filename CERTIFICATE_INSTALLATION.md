# SSL Certificate Installation Guide

## For Other Machines to Access Japanese Mastery

### Method 1: Automatic Installation (Recommended)

**Windows:**
1. Copy `install-certificate.bat` and `rootCA.pem` to the other machine
2. Right-click `install-certificate.bat` and "Run as Administrator"

**Alternative (PowerShell):**
1. Copy `install-certificate.ps1` and `rootCA.pem` to the other machine
2. Right-click `install-certificate.ps1` and "Run with PowerShell as Administrator"

### Method 2: Manual Installation

1. Copy `rootCA.pem` to the other machine
2. Double-click `rootCA.pem`
3. Click "Install Certificate"
4. Choose "Local Machine" → "Place all certificates in the following store"
5. Click "Browse" → Select "Trusted Root Certification Authorities"
6. Click "OK" → "Next" → "Finish"

### Method 3: Browser-Specific Trust

**Chrome/Edge:**
1. Go to `chrome://flags/#allow-insecure-localhost`
2. Enable "Allow invalid certificates for resources loaded from localhost"
3. Restart browser

**Firefox:**
1. Go to `about:config`
2. Search for `security.enterprise_roots.enabled`
3. Set to `true`

### Method 4: Temporary Access

If you can't install the certificate, you can temporarily access the app by:
1. Going to `https://192.168.1.200:8443/api/test` first
2. If you see a certificate warning, try typing `thisisunsafe` (Chrome) or `badidea` (Firefox)
3. Then access `https://192.168.1.200:3000`

## After Installation

Once the certificate is installed, you can access:
- **Main App**: https://192.168.1.200:3000
- **Register**: https://192.168.1.200:3000/register
- **Login**: https://192.168.1.200:3000/login

## Troubleshooting

If you still get certificate errors:
1. Make sure the certificate is installed in "Trusted Root Certification Authorities"
2. Restart the browser completely
3. Clear browser cache and cookies
4. Try accessing the API directly first: https://192.168.1.200:8443/api/test 