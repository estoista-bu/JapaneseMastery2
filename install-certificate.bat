@echo off
echo Installing SSL Certificate for Japanese Mastery...
echo.

REM Copy the certificate to a temporary location
copy "rootCA.pem" "%TEMP%\rootCA.pem"

REM Install the certificate using certutil
certutil -addstore -f "ROOT" "%TEMP%\rootCA.pem"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Certificate installed successfully!
    echo 🌐 You can now access: https://192.168.1.200:3000
    echo.
) else (
    echo.
    echo ❌ Failed to install certificate. Please run as Administrator.
    echo.
)

REM Clean up
del "%TEMP%\rootCA.pem"

pause 