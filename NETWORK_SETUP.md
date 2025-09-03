# 🌐 Network Setup for Japanese Mastery

## Quick Setup for Other Machines

### Step 1: Install Certificate (One-time setup)

**Option A: Automatic (Recommended)**
1. Copy `install-certificate.bat` and `rootCA.pem` to the other machine
2. Right-click `install-certificate.bat` → "Run as Administrator"

**Option B: Manual**
1. Copy `rootCA.pem` to the other machine
2. Double-click `rootCA.pem` → "Install Certificate"
3. Choose "Local Machine" → "Trusted Root Certification Authorities"

### Step 2: Access the App

Once the certificate is installed, access:
- **Main App**: https://192.168.1.200:3000
- **Register**: https://192.168.1.200:3000/register
- **Login**: https://192.168.1.200:3000/login

## 🚀 Start Your Servers

```bash
# Terminal 1: Start Laravel
cd backend
php artisan serve --host=0.0.0.0 --port=8000

# Terminal 2: Start HTTPS Proxy
npm run laravel:https

# Terminal 3: Start Next.js
npm run dev:https
```

## ✅ Features Available

- ✅ **HTTPS Security**: All traffic encrypted
- ✅ **Microphone Support**: Works on all devices
- ✅ **Network Access**: Accessible from any device on your network
- ✅ **Registration/Login**: Full authentication system

## 🔧 Troubleshooting

**If certificate errors persist:**
1. Restart the browser completely
2. Clear browser cache and cookies
3. Try accessing https://192.168.1.200:8443/api/test first
4. Make sure the certificate is in "Trusted Root Certification Authorities"

**If microphone doesn't work:**
1. Make sure you're using HTTPS (not HTTP)
2. Check browser permissions for microphone access
3. Try refreshing the page 