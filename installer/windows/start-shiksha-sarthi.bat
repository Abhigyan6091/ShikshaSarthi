@echo off
setlocal
cd /d "%~dp0"
if not exist ".env" (
  if exist ".env.local-school.example" (
    copy ".env.local-school.example" ".env" >nul
  )
)
docker --version >nul 2>&1
if errorlevel 1 (
  echo Docker Desktop is not installed or is not available on PATH.
  echo Run install-prerequisites.ps1, then restart this script.
  pause
  exit /b 1
)
docker compose up -d --build
start http://localhost:6050
endlocal
