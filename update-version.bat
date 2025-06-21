@echo off
setlocal enabledelayedexpansion

REM IamHereApp Version Update Script for Windows
REM Usage: update-version.bat [options]

echo.
echo 🚀 IamHereApp Version Update Tool (Windows)
echo ==========================================
echo.

REM Check if Node.js is available
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Pass all arguments to the Node.js script
node update-version.js %*

REM Check if the script was successful
if errorlevel 1 (
    echo.
    echo ❌ Version update failed
    pause
    exit /b 1
)

echo.
echo ✅ Version update completed successfully!
echo.
echo 📝 Quick commands:
echo   git status          - Check changes
echo   git add .           - Stage all changes
echo   git commit -m "..."  - Commit with message
echo   git push origin main --tags - Push with tags
echo.
pause 