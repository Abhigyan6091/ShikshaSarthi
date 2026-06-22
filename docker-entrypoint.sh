#!/bin/sh
# ─── ShikshaSarthi – Container entrypoint ───────────────────────────────────
# Starts the Node.js backend and then launches nginx in the foreground.
# ─────────────────────────────────────────────────────────────────────────────

set -e

echo "========================================"
echo " ShikshaSarthi – starting services..."
echo "========================================"

# ── Export backend env vars for the Node process ──
export NODE_ENV="${NODE_ENV:-production}"
export PORT="${BACKEND_PORT:-5000}"
export USE_LOCAL_DB="${USE_LOCAL_DB:-false}"
export MONGO_URI="${MONGO_URI:-mongodb://mongo:27017/app}"
export MONGO_URI_LOCAL="${MONGO_URI_LOCAL:-mongodb://mongo:27017/app}"

# ── Start backend in the background ──
echo "[1/2] Starting Node.js backend on port ${PORT}..."
cd /app/backend
node index.js &
BACKEND_PID=$!
cd /app

# ── Start nginx in the foreground (container main process) ──
echo "[2/2] Starting nginx..."
nginx -g "daemon off;" &
NGINX_PID=$!

# ── Trap SIGTERM / SIGINT and forward to children ──
trap "echo 'Shutting down...'; kill $BACKEND_PID $NGINX_PID 2>/dev/null; exit 0" TERM INT

# ── Wait for any child to exit ──
wait -n $BACKEND_PID $NGINX_PID

# If the backend died, exit so the container restarts
if ! kill -0 $BACKEND_PID 2>/dev/null; then
  echo "Backend exited – stopping container."
  exit 1
fi
