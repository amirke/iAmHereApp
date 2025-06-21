@echo off
echo ================================================
echo  Testing Automatic Port Cleanup Functionality
echo ================================================
echo.

set SERVER_PORT=3001
set LOCAL_IP=192.168.1.17

echo 1. Checking current processes on port %SERVER_PORT%...
"C:\Program Files\PuTTY\plink.exe" -ssh -P 2211 -l manageuser -pw StrongPassword123 -batch %LOCAL_IP% "sudo netstat -tlnp | grep :%SERVER_PORT% || echo 'No process found on port %SERVER_PORT%'"
echo.

echo 2. Starting a dummy server on port %SERVER_PORT% (for 5 seconds)...
"C:\Program Files\PuTTY\plink.exe" -ssh -P 2211 -l manageuser -pw StrongPassword123 -batch %LOCAL_IP% "timeout 5s /var/packages/Node.js_v20/target/usr/local/bin/node -e \"require('http').createServer().listen(%SERVER_PORT%, () => console.log('Dummy server on %SERVER_PORT%'))\" &"
echo.

echo 3. Waiting 2 seconds for dummy server to start...
timeout /t 2 /nobreak > nul
echo.

echo 4. Checking if dummy server is running...
"C:\Program Files\PuTTY\plink.exe" -ssh -P 2211 -l manageuser -pw StrongPassword123 -batch %LOCAL_IP% "sudo netstat -tlnp | grep :%SERVER_PORT%"
echo.

echo 5. Now starting the real backend (should automatically kill dummy server)...
"C:\Program Files\PuTTY\plink.exe" -ssh -P 2211 -l manageuser -pw StrongPassword123 -batch %LOCAL_IP% "cd /volume2/video/Projects/IamHereApp/backend && /var/packages/Node.js_v20/target/usr/local/bin/node app.js" &
echo.

echo 6. Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak > nul
echo.

echo 7. Testing if backend is now running properly...
"C:\Program Files\PuTTY\plink.exe" -ssh -P 2211 -l manageuser -pw StrongPassword123 -batch %LOCAL_IP% "curl -k https://%LOCAL_IP%:%SERVER_PORT%/health"
echo.

echo ================================================
echo  Port Cleanup Test Complete!
echo  Check the backend logs to see the cleanup process
echo ================================================
pause 