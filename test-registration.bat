@echo off
echo Testing updated registration endpoint with display_name...
echo.
echo Running test-connection.js on NAS to test registration:
"C:\Program Files\PuTTY\plink.exe" -ssh -P 2211 -l manageuser -pw StrongPassword123 -batch 192.168.1.17 "cd /volume2/video/Projects/IamHereApp/backend && /var/packages/Node.js_v20/target/usr/local/bin/node test-connection.js"
echo.
echo Testing registration endpoint directly with curl:
"C:\Program Files\PuTTY\plink.exe" -ssh -P 2211 -l manageuser -pw StrongPassword123 -batch 192.168.1.17 "curl -k -X POST https://192.168.1.17:3001/api/register -H \"Content-Type: application/json\" -d '{\"username\":\"testuser2\",\"password\":\"testpass\",\"display_name\":\"Test User Two\",\"language\":\"en\"}'"
pause 