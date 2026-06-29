#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RELEASES_DIR="$ROOT_DIR/releases"
CURRENT_DIR="$RELEASES_DIR/current"
LATEST_ROLLBACK="$(find "$RELEASES_DIR" -maxdepth 1 -type d -name 'rollback-*' 2>/dev/null | sort | tail -n 1)"
APP_URL="${APP_HEALTH_URL:-http://127.0.0.1:6050/health}"

if [[ -z "$LATEST_ROLLBACK" ]]; then
  echo "No rollback release found"
  exit 2
fi

FAILED_DIR="$RELEASES_DIR/failed-$(date -u +"%Y%m%d%H%M%S")"
if [[ -d "$CURRENT_DIR" ]]; then
  mv "$CURRENT_DIR" "$FAILED_DIR"
fi

mv "$LATEST_ROLLBACK" "$CURRENT_DIR"

if [[ -f "$CURRENT_DIR/docker-image.tar" ]]; then
  echo "Loading rollback Docker image..."
  docker load -i "$CURRENT_DIR/docker-image.tar"
fi

echo "Recreating app container from rollback release; MongoDB volume is preserved..."
docker compose -f "$ROOT_DIR/docker-compose.yml" up -d --no-deps --force-recreate app

for attempt in $(seq 1 30); do
  if curl -fsS "$APP_URL" >/dev/null 2>&1; then
    echo "Rollback restored $LATEST_ROLLBACK to $CURRENT_DIR and health check passed."
    exit 0
  fi
  sleep 2
done

echo "Rollback restored files, but health check did not pass."
exit 4
