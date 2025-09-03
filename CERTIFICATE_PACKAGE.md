# 🔐 Certificate Package for Network Access

## Files to Share with Other Machines

Copy these files to other machines:

1. **`rootCA.pem`** - The root certificate authority
2. **`install-certificate.bat`** - Automatic installer (Windows)
3. **`install-certificate.ps1`** - PowerShell installer (Windows)

## Installation Instructions

### For Windows Users:

**Option A: Automatic (Recommended)**
1. Copy the files to the other machine
2. Right-click `install-certificate.bat`
3. Select "Run as Administrator"
4. Follow the prompts

**Option B: Manual**
1. Copy `rootCA.pem` to the other machine
2. Double-click `rootCA.pem`
3. Click "Install Certificate"
4. Choose "Local Machine" → "Trusted Root Certification Authorities"
5. Click "OK" → "Next" → "Finish"

### For Other Operating Systems:

**macOS:**
```bash
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain rootCA.pem
```

**Linux:**
```bash
sudo cp rootCA.pem /usr/local/share/ca-certificates/
sudo update-ca-certificates
```

## After Installation

Once installed, users can access:
- **Main App**: https://192.168.1.200:3000
- **Register**: https://192.168.1.200:3000/register
- **Login**: https://192.168.1.200:3000/login

## Troubleshooting

If users still get certificate errors:
1. Restart the browser completely
2. Clear browser cache and cookies
3. Make sure the certificate is in "Trusted Root Certification Authorities"
4. Try accessing https://192.168.1.200:8443/api/test first

## Certificate Details

- **Valid for**: localhost, 127.0.0.1, ::1, 192.168.1.200
- **Expires**: 10 years from generation date
- **Type**: Self-signed certificate authority
- **Features**: Long-term validity, no need to renew frequently 