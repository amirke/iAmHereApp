@echo off
echo Debugging backend startup...
echo.
echo Checking Node.js version:
"C:\Program Files\PuTTY\plink.exe" -ssh -P 2211 -l manageuser -pw StrongPassword123 -batch 192.168.1.17 "node --version"
echo.
echo Checking if project directory exists:
"C:\Program Files\PuTTY\plink.exe" -ssh -P 2211 -l manageuser -pw StrongPassword123 -batch 192.168.1.17 "ls -la /volume2/video/Projects/IamHereApp/"
echo.
echo Checking backend directory:
"C:\Program Files\PuTTY\plink.exe" -ssh -P 2211 -l manageuser -pw StrongPassword123 -batch 192.168.1.17 "ls -la /volume2/video/Projects/IamHereApp/backend/"
echo.
echo Checking backend log:
"C:\Program Files\PuTTY\plink.exe" -ssh -P 2211 -l manageuser -pw StrongPassword123 -batch 192.168.1.17 "cat /volume2/video/Projects/IamHereApp/backend/backend.log"
echo.
echo Checking running processes:
"C:\Program Files\PuTTY\plink.exe" -ssh -P 2211 -l manageuser -pw StrongPassword123 -batch 192.168.1.17 "ps aux | grep app.js"
pause 