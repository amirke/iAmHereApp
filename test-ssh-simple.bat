@echo off
echo Testing basic SSH connection...
"C:\Program Files\PuTTY\plink.exe" -ssh -P 2211 -l manageuser 192.168.1.17 "whoami"
pause 