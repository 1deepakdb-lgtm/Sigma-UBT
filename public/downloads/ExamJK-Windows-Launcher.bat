@echo off
title ExamJK Windows Desktop App Launcher
echo ========================================================
echo        ExamJK - Japanese ^& Korean UBT Exam System
echo ========================================================
echo.
echo Launching ExamJK in native standalone app window...
echo.

set "TARGET_URL=http://localhost:3000"
if "%~1" neq "" set "TARGET_URL=%~1"

:: Check for Google Chrome
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --app="%TARGET_URL%"
    exit /b 0
)
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" --app="%TARGET_URL%"
    exit /b 0
)

:: Check for Microsoft Edge
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app="%TARGET_URL%"
    exit /b 0
)
if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" --app="%TARGET_URL%"
    exit /b 0
)

:: Check for Brave Browser
if exist "%LOCALAPPDATA%\BraveSoftware\Brave-Browser\Application\brave.exe" (
    start "" "%LOCALAPPDATA%\BraveSoftware\Brave-Browser\Application\brave.exe" --app="%TARGET_URL%"
    exit /b 0
)

:: Default browser fallback
start "" "%TARGET_URL%"
exit /b 0
