@echo off
curl http://localhost:6050/health
echo.
curl http://localhost:6050/app/status
echo.
pause
