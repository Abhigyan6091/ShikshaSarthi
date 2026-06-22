#!/usr/bin/env bash
set -e

# ─── ShikshaSarthi (विद्यासारथी) – NMMS Prep Platform ─────────────────────
# Unified startup script – starts MongoDB, backend API, and frontend dev server.
# Run this from the project root (ShikshaSarthi/) directory.
#
# Usage:
#   chmod +x start.sh && ./start.sh
#   ./start.sh          # default: starts all services
#   ./start.sh --build  # also runs `npm run build` for the frontend first
#   ./start.sh --vqg    # also starts the standalone VQG backend on port 9005
#   ./start.sh --help   # show this message
#
# Note: The VQG (Video Question Generator) is automatically managed by the
# Express backend as a subprocess when first accessed via /vqg/.
# The --vqg flag is only needed if you want it on a dedicated port.
# ─────────────────────────────────────────────────────────────────────────────

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
MONGO_DBPATH="$PROJECT_DIR/mongodb/data"

# Colour helpers
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; NC='\033[0m'
info()  { echo -e "${GREEN}[INFO]${NC}  $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
err()   { echo -e "${RED}[ERROR]${NC} $1" >&2; }
header(){ echo -e "\n${CYAN}━━━ $1 ━━━${NC}"; }

if [[ "$1" == "--help" ]]; then
  sed -n '3,13p' "$0"
  exit 0
fi

header "Pre-flight checks"
for cmd in node npm mongod; do
  if ! command -v "$cmd" &>/dev/null; then
    err "'$cmd' is required but not installed. Aborting."
    exit 1
  fi
done
info "Node.js : $(node --version)"
info "npm     : $(npm --version)"
info "MongoDB : $(mongod --version 2>&1 | head -1)"

header "Database setup"
mkdir -p "$MONGO_DBPATH"
info "MongoDB data directory: $MONGO_DBPATH"

header "Permissions"
chmod -R u+w "$MONGO_DBPATH"                                                          "$BACKEND_DIR/data" "$PROJECT_DIR/uploads" 2>/dev/null || true
chmod u+w "$PROJECT_DIR/vite.config.ts" "$PROJECT_DIR/.env" "$PROJECT_DIR/package.json" "$BACKEND_DIR/.env" "$BACKEND_DIR/package.json" 2>/dev/null || true
chmod -R u+w "$PROJECT_DIR/node_modules" "$BACKEND_DIR/node_modules" 2>/dev/null || true
info "Runtime directory permissions verified."

header "Environment"
if [[ -f "$PROJECT_DIR/.env" ]]; then
  CURRENT_URL=$(grep '^VITE_API_URL=' "$PROJECT_DIR/.env" | head -1 | cut -d= -f2)
  info "VITE_API_URL = $CURRENT_URL"
  if echo "$CURRENT_URL" | grep -q 'localhost'; then
    info "Frontend will call the API on localhost (same-machine access only)."
    info "For remote access, set VITE_API_URL=http://<server-ip>:5000 in .env"
  fi
else
  warn ".env not found – frontend may not reach the backend."
fi

header "Dependencies"
if [[ ! -d "$PROJECT_DIR/node_modules" ]]; then
  info "Installing frontend dependencies (npm install) ..."
  npm install --prefix "$PROJECT_DIR"
else
  info "Frontend dependencies already installed."
fi
if [[ ! -d "$BACKEND_DIR/node_modules" ]]; then
  info "Installing backend dependencies (npm install) ..."
  npm install --prefix "$BACKEND_DIR"
else
  info "Backend dependencies already installed."
fi

if [[ "$1" == "--build" ]]; then
  header "Building frontend for production"
  npm run build --prefix "$PROJECT_DIR"
  info "Frontend built – dist/ is ready."
fi

cleanup() {
  echo ""
  info "Shutting down services ..."
  kill "$MONGO_PID" "$BACKEND_PID" "$FRONTEND_PID" "$VQG_PID" 2>/dev/null || true
  wait "$MONGO_PID" "$BACKEND_PID" "$FRONTEND_PID" "$VQG_PID" 2>/dev/null || true
  info "All services stopped. Goodbye!"
}
trap cleanup EXIT INT TERM

header "Starting MongoDB"

if pgrep -x mongod &>/dev/null; then
  MONGO_PID=$(pgrep -x mongod | head -1)
  info "MongoDB already running (PID $MONGO_PID) – skipping startup."
else
  SOCK="/tmp/mongodb-27017.sock"
  if [[ -e "$SOCK" ]] && [[ ! -O "$SOCK" ]]; then
    warn "Stale MongoDB socket ($SOCK) not owned by current user – attempting removal ..."
    if command -v docker &>/dev/null; then
      docker run --rm -v /tmp:/tmp alpine rm -f "$SOCK" 2>/dev/null && info "Removed stale socket." || warn "Could not remove socket; try: sudo rm -f $SOCK"
    else
      warn "Could not remove socket; try: sudo rm -f $SOCK"
    fi
  fi

  mongod --dbpath "$MONGO_DBPATH" --port 27017 --bind_ip 127.0.0.1 --logpath "$MONGO_DBPATH/mongod.log" --fork
  MONGO_PID=$(pgrep -n mongod || echo "")
  if [[ -n "$MONGO_PID" ]]; then
    info "MongoDB started       ->  mongodb://127.0.0.1:27017  (PID $MONGO_PID)"
  else
    err "MongoDB failed to start. Check log: $MONGO_DBPATH/mongod.log"
    exit 1
  fi
fi
sleep 2

# ── Optional: Start VQG (Video Question Generator) backend ────
VQG_PID=""
if [[ "$1" == "--vqg" ]]; then
  VQG_DIR="$PROJECT_DIR/QuestionGenerator/VQG"
  if [[ -f "$VQG_DIR/backend/main.py" ]]; then
    header "Starting VQG Backend (FastAPI)"
    if command -v uvicorn &>/dev/null; then
      cd "$VQG_DIR"
      uvicorn backend.main:app --host 0.0.0.0 --port 9005 &
      VQG_PID=$!
      cd "$PROJECT_DIR"
      info "VQG FastAPI backend ->  http://localhost:9005  (PID $VQG_PID)"
    else
      warn "uvicorn not found – skipping VQG startup. Install with: pip install uvicorn"
    fi
  else
    warn "VQG backend not found at $VQG_DIR – skipping."
  fi
fi

header "Starting Backend API"
cd "$BACKEND_DIR"
if [[ -f "nodemon.json" ]]; then
  npx nodemon index.js &
  BACKEND_PID=$!
  info "Backend (nodemon)     ->  http://localhost:5000  (PID $BACKEND_PID)"
else
  node index.js &
  BACKEND_PID=$!
  info "Backend (node)        ->  http://localhost:5000  (PID $BACKEND_PID)"
fi
cd "$PROJECT_DIR"

header "Starting Frontend Dev Server"

# Try to free port 8080 if something is already listening on it
if ss -tlnp 2>/dev/null | grep -q ':8080 '; then
  warn "Port 8080 already in use – Vite will auto-select another port."
fi

npx vite --host 0.0.0.0 --port 8080 &
FRONTEND_PID=$!

# Wait a moment then detect the actual port Vite bound to
sleep 4
VITE_PORT=$(ss -tlnp 2>/dev/null | grep -oE ':808[0-9]' | head -1 | tr -d ':' || echo "8080")
info "Frontend (Vite)       ->  http://localhost:${VITE_PORT}  (PID $FRONTEND_PID)"

sleep 1

header "ShikshaSarthi – All Services Running"
echo ""
echo -e "  ${GREEN}Frontend UI${NC}    http://localhost:${VITE_PORT}"
echo -e "  ${GREEN}Backend API${NC}     http://localhost:5000"
echo -e "  ${GREEN}MongoDB${NC}         mongodb://127.0.0.1:27017"
echo -e "  ${GREEN}VQG${NC}              http://localhost:${VITE_PORT}/vqg/  (auto-managed by backend)"
if [[ -n "$VQG_PID" ]] && kill -0 "$VQG_PID" 2>/dev/null; then
  echo -e "  ${GREEN}VQG Dedicated${NC}   http://localhost:9005"
fi
echo ""
echo -e "  ${YELLOW}Press Ctrl+C to stop all services.${NC}"
echo ""

wait
