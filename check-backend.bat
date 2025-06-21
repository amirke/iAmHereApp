@echo off
echo Checking if backend is running...
"C:\Program Files\PuTTY\plink.exe" -ssh -P 2211 -l manageuser -pw StrongPassword123 -batch 192.168.1.17 "ps aux | grep node || echo 'No Node processes found'"
echo.
echo Testing if backend responds to HTTP requests...
"C:\Program Files\PuTTY\plink.exe" -ssh -P 2211 -l manageuser -pw StrongPassword123 -batch 192.168.1.17 "curl -k https://192.168.1.17:3001/health || echo 'Backend not responding'"
pause 