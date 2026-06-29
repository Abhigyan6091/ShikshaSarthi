#!/usr/bin/env bash
set -euo pipefail

PACKAGE_PATH="${1:-}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RELEASES_DIR="$ROOT_DIR/releases"
CURRENT_DIR="$RELEASES_DIR/current"
ROLLBACK_DIR="$RELEASES_DIR/rollback-$(date -u +"%Y%m%d%H%M%S")"
WORK_DIR="$RELEASES_DIR/work-$(date -u +"%Y%m%d%H%M%S")"
APP_URL="${APP_HEALTH_URL:-http://127.0.0.1:6050/health}"

if [[ -z "$PACKAGE_PATH" || ! -f "$PACKAGE_PATH" ]]; then
  echo "Usage: scripts/apply-update.sh /path/to/verified-update-package.zip"
  exit 2
fi

if ! command -v unzip >/dev/null 2>&1; then
  echo "unzip is required to apply update packages"
  exit 3
fi

mkdir -p "$RELEASES_DIR"
mkdir -p "$WORK_DIR"

echo "Creating pre-update backup..."
if command -v docker >/dev/null 2>&1; then
  docker compose -f "$ROOT_DIR/docker-compose.yml" exec -T app sh -lc \
    'wget -qO- --header="x-user-role: superadmin" --post-data="" http://127.0.0.1:5000/api/backup/create >/dev/null || true' || true
fi

if [[ -d "$CURRENT_DIR" ]]; then
  mv "$CURRENT_DIR" "$ROLLBACK_DIR"
fi

mkdir -p "$CURRENT_DIR"
unzip -q "$PACKAGE_PATH" -d "$WORK_DIR"

if [[ -f "$WORK_DIR/docker-image.tar" ]]; then
  echo "Loading Docker image from update bundle..."
  docker load -i "$WORK_DIR/docker-image.tar"
fi

cp -a "$WORK_DIR"/. "$CURRENT_DIR"/

echo "Recreating app container only; MongoDB volume is preserved..."
docker compose -f "$ROOT_DIR/docker-compose.yml" up -d --no-deps --force-recreate app

echo "Waiting for app health at $APP_URL..."
for attempt in $(seq 1 30); do
  if curl -fsS "$APP_URL" >/dev/null 2>&1; then
    echo "Update applied and health check passed."
    rm -rf "$WORK_DIR"
    exit 0
  fi
  sleep 2
done

echo "Update was loaded, but health check did not pass. Use scripts/rollback-update.sh."
exit 4
