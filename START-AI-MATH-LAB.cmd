@echo off
cd /d "%~dp0"
start "" powershell -NoProfile -Command "Start-Sleep -Seconds 4; Start-Process 'http://localhost:3000'"
call npm run dev
pause
