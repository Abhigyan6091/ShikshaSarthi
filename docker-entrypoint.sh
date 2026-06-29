#!/bin/sh
# Starts the Node.js backend and then launches nginx in the foreground.

set -e

echo "========================================"
echo " ShikshaSarthi - starting services..."
echo "========================================"

export NODE_ENV="${NODE_ENV:-production}"
export PORT="${BACKEND_PORT:-${PORT:-5000}}"
export FRONTEND_PORT="${FRONTEND_PORT:-6050}"
export APP_MODE="${APP_MODE:-local-school}"
export APP_VERSION="${APP_VERSION:-1.0.0}"
export USE_LOCAL_DB="${USE_LOCAL_DB:-true}"
export MONGO_URI="${MONGO_URI:-mongodb://mongo:27017/app}"
export MONGO_URI_LOCAL="${MONGO_URI_LOCAL:-mongodb://mongo:27017/app}"
export SYNC_AUTO_ENABLED="${SYNC_AUTO_ENABLED:-false}"
export SYNC_NODE_ROLE="${SYNC_NODE_ROLE:-local}"
export AI_HINTS_ENABLED="${AI_HINTS_ENABLED:-false}"
export CLOUDINARY_ENABLED="${CLOUDINARY_ENABLED:-false}"
export LOCAL_UPLOADS_ENABLED="${LOCAL_UPLOADS_ENABLED:-true}"
export BACKUP_ENABLED="${BACKUP_ENABLED:-true}"
export BACKUP_DIR="${BACKUP_DIR:-/app/backend/backups}"

echo "[1/2] Starting Node.js backend on port ${PORT}..."
cd /app/backend
node index.js &
BACKEND_PID=$!
cd /app

echo "[2/2] Starting nginx..."
nginx -g "daemon off;" &
NGINX_PID=$!

trap "echo 'Shutting down...'; kill $BACKEND_PID $NGINX_PID 2>/dev/null; exit 0" TERM INT

wait -n $BACKEND_PID $NGINX_PID

if ! kill -0 $BACKEND_PID 2>/dev/null; then
  echo "Backend exited - stopping container."
  exit 1
fi
