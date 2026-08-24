@echo off
setlocal

set PROJECT_DIR=%~dp0
set PROJECT_DIR=%PROJECT_DIR:~0,-1%
set MONGO_DBPATH=%PROJECT_DIR%\mongodb\data
set MONGO_LOCAL_BIN=%PROJECT_DIR%\mongodb\bin\mongod.exe

echo ====================================================
echo ShikshaSarthi Offline Starter
echo ====================================================

if not exist "%MONGO_DBPATH%" mkdir "%MONGO_DBPATH%"

echo [1/3] Starting MongoDB...
if exist "%MONGO_LOCAL_BIN%" (
  start "MongoDB" cmd /k "\"%MONGO_LOCAL_BIN%\" --dbpath \"%MONGO_DBPATH%\" --port 27017 --bind_ip 127.0.0.1"
) else (
  start "MongoDB" cmd /k "mongod --dbpath \"%MONGO_DBPATH%\" --port 27017 --bind_ip 127.0.0.1"
)

timeout /t 3 >nul

echo [2/3] Starting backend API...
start "Backend API" cmd /k "cd /d \"%PROJECT_DIR%\backend\" && if not exist node_modules npm install && npm start"

timeout /t 2 >nul

echo [3/3] Starting frontend UI...
start "Frontend UI" cmd /k "cd /d \"%PROJECT_DIR%\" && if not exist node_modules npm install && npm run dev -- --host 0.0.0.0 --port 6091"

echo.
echo Services launched:
echo - MongoDB: localhost:27017
echo - Backend: http://localhost:5000
echo - Frontend: http://localhost:6091
echo.
pause
