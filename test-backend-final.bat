@echo off
echo ================================================
echo  IamHereApp Backend Test Suite
echo  Testing Updated Registration with display_name
echo ================================================
echo.

REM Define constants (should match backend/constants.js)
set SERVER_PORT=3001
set DOMAIN_NAME=amirnas.dynamic-dns.net
set LOCAL_IP=192.168.1.17

echo 1. Checking if backend is running...
"C:\Program Files\PuTTY\plink.exe" -ssh -P 2211 -l manageuser -pw StrongPassword123 -batch %LOCAL_IP% "ps aux | grep 'node app.js' | grep -v grep || echo 'Backend not running'"
echo.

echo 2. Testing health endpoint...
"C:\Program Files\PuTTY\plink.exe" -ssh -P 2211 -l manageuser -pw StrongPassword123 -batch %LOCAL_IP% "curl -k https://%LOCAL_IP%:%SERVER_PORT%/health"
echo.

echo 3. Running test-connection.js (includes display_name test)...
"C:\Program Files\PuTTY\plink.exe" -ssh -P 2211 -l manageuser -pw StrongPassword123 -batch %LOCAL_IP% "cd /volume2/video/Projects/IamHereApp/backend && /var/packages/Node.js_v20/target/usr/local/bin/node test-connection.js"
echo.

echo 4. Testing registration endpoint directly with display_name...
"C:\Program Files\PuTTY\plink.exe" -ssh -P 2211 -l manageuser -pw StrongPassword123 -batch %LOCAL_IP% "curl -k -X POST https://%LOCAL_IP%:%SERVER_PORT%/api/register -H \"Content-Type: application/json\" -d '{\"username\":\"displaytest\",\"password\":\"testpass\",\"display_name\":\"Display Test User\",\"language\":\"en\"}'"
echo.

echo 5. Testing registration endpoint via domain...
"C:\Program Files\PuTTY\plink.exe" -ssh -P 2211 -l manageuser -pw StrongPassword123 -batch %LOCAL_IP% "curl -k -X POST https://%DOMAIN_NAME%:%SERVER_PORT%/api/register -H \"Content-Type: application/json\" -d '{\"username\":\"domaintest\",\"password\":\"testpass\",\"display_name\":\"Domain Test User\",\"language\":\"en\"}'"
echo.

echo ================================================
echo  Test Suite Complete!
echo ================================================
pause 