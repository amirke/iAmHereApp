@echo off
echo Testing NAS SSH connection...
"C:\Program Files\PuTTY\plink.exe" -ssh -P 2211 -l manageuser -pw StrongPassword123 192.168.1.17 "cd /volume2/video/Projects/IamHereApp/backend && node test-connection.js"
pause 