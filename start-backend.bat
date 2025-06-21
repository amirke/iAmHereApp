@echo off
echo Starting backend server on NAS...
"C:\Program Files\PuTTY\plink.exe" -ssh -P 2211 -l manageuser -pw StrongPassword123 -batch 192.168.1.17 "cd /volume2/video/Projects/IamHereApp/backend && nohup node app.js > backend.log 2>&1 &"
echo Backend server started in background
echo.
echo Waiting 3 seconds for server to start...
timeout /t 3 /nobreak > nul
echo.
echo Testing backend health...
"C:\Program Files\PuTTY\plink.exe" -ssh -P 2211 -l manageuser -pw StrongPassword123 -batch 192.168.1.17 "curl -k https://192.168.1.17:3001/health"
pause 