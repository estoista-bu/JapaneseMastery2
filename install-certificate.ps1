# Install SSL Certificate for Japanese Mastery
Write-Host "Installing SSL Certificate for Japanese Mastery..." -ForegroundColor Green
Write-Host ""

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ This script requires Administrator privileges." -ForegroundColor Red
    Write-Host "Please right-click and 'Run as Administrator'" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

try {
    # Import the certificate
    $cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2("rootCA.pem")
    $store = New-Object System.Security.Cryptography.X509Certificates.X509Store("Root", "LocalMachine")
    $store.Open("ReadWrite")
    $store.Add($cert)
    $store.Close()
    
    Write-Host "✅ Certificate installed successfully!" -ForegroundColor Green
    Write-Host "🌐 You can now access: https://192.168.1.200:3000" -ForegroundColor Cyan
    Write-Host ""
} catch {
    Write-Host "❌ Failed to install certificate: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

Read-Host "Press Enter to continue" 