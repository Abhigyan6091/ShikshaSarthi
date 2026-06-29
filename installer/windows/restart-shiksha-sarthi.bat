@echo off
cd /d "%~dp0"
docker compose down
docker compose up -d --build
start http://localhost:6050
