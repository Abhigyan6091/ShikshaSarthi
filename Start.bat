@echo off
setlocal enabledelayedexpansion

:: Get current directory
set PROJECT_DIR=%cd%

title 🚀 Starting React + Node Project...

echo ====================================================
echo     🔄 Initializing Full Stack Application...
echo ====================================================

echo.
echo 🔧 Starting BACKEND server with nodemon...
start cmd /k "title 🌐 Backend Server && cd /d %PROJECT_DIR%\backend && echo ✅ Backend is running on port 5000... && nodemon index.js"

timeout /t 2 >nul

echo.
echo 🎨 Starting FRONTEND (Vite React) server...
start cmd /k "title 🎨 Frontend (Vite) && cd /d %PROJECT_DIR% && echo ✅ Frontend is running on http://localhost:6091 ... && npm run dev"

echo.
echo ====================================================
echo ✅ Both servers started! Open browser to check:
echo    → Frontend: http://localhost:6091
echo    → Backend:  http://localhost:5000
echo ====================================================
echo.

pause
