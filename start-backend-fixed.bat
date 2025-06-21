@echo off
echo Starting backend server with full Node.js path...
"C:\Program Files\PuTTY\plink.exe" -ssh -P 2211 -l manageuser -pw StrongPassword123 -batch 192.168.1.17 "cd /volume2/video/Projects/IamHereApp/backend && nohup /var/packages/Node.js_v20/target/usr/local/bin/node app.js > backend.log 2>&1 &"
echo Backend server started in background
echo.
echo Waiting 5 seconds for server to start...
timeout /t 5 /nobreak > nul
echo.
echo Testing backend health...
"C:\Program Files\PuTTY\plink.exe" -ssh -P 2211 -l manageuser -pw StrongPassword123 -batch 192.168.1.17 "curl -k https://192.168.1.17:3001/health"
echo.
echo Checking backend log for errors:
"C:\Program Files\PuTTY\plink.exe" -ssh -P 2211 -l manageuser -pw StrongPassword123 -batch 192.168.1.17 "tail -n 10 /volume2/video/Projects/IamHereApp/backend/backend.log"
pause 