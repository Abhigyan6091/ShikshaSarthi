#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERSION="${1:-$(node -p "require('$ROOT_DIR/backend/package.json').version")}"
CHANNEL="${RELEASE_CHANNEL:-stable}"
RELEASE_DATE="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
OUT_DIR="$ROOT_DIR/dist-release"
WORK_DIR="$OUT_DIR/update-bundle"
PACKAGE_NAME="shiksha-sarthi-update-$VERSION.zip"
IMAGE_TAR="${IMAGE_TAR:-$OUT_DIR/shiksha-sarthi-image-$VERSION.tar}"

rm -rf "$WORK_DIR"
mkdir -p "$WORK_DIR/scripts" "$OUT_DIR"

if [[ -f "$IMAGE_TAR" ]]; then
  cp "$IMAGE_TAR" "$WORK_DIR/docker-image.tar"
else
  echo "Warning: IMAGE_TAR not found at $IMAGE_TAR; bundle will not include a Docker image." >&2
fi

cp "$ROOT_DIR/docker-compose.yml" "$WORK_DIR/docker-compose.yml"
cp "$ROOT_DIR/.env.local-school.example" "$WORK_DIR/.env.local-school.example"
cp "$ROOT_DIR/scripts/apply-update.sh" "$WORK_DIR/scripts/apply-update.sh"
cp "$ROOT_DIR/scripts/rollback-update.sh" "$WORK_DIR/scripts/rollback-update.sh"
cp "$ROOT_DIR/scripts/backup-local-school.sh" "$WORK_DIR/scripts/backup-local-school.sh"

cat > "$WORK_DIR/release-metadata.json" <<JSON
{
  "app": "ShikshaSarthi",
  "version": "$VERSION",
  "channel": "$CHANNEL",
  "releaseDate": "$RELEASE_DATE",
  "port": 6050,
  "packageType": "full-docker-app-update",
  "preserves": [
    "mongo_data",
    "uploads_data",
    "backups_data",
    "updates_data",
    "audio_cache",
    ".env"
  ]
}
JSON

(cd "$WORK_DIR" && zip -qr "$OUT_DIR/$PACKAGE_NAME" .)
SHA256="$(sha256sum "$OUT_DIR/$PACKAGE_NAME" | awk '{print $1}')"
printf "%s  %s\n" "$SHA256" "$PACKAGE_NAME" > "$OUT_DIR/$PACKAGE_NAME.sha256"

cat > "$OUT_DIR/aws-update-manifest.json" <<JSON
{
  "app": "ShikshaSarthi",
  "latestVersion": "$VERSION",
  "version": "$VERSION",
  "channel": "$CHANNEL",
  "releaseDate": "$RELEASE_DATE",
  "packageFile": "$PACKAGE_NAME",
  "packageKey": "updates/$CHANNEL/$PACKAGE_NAME",
  "sha256": "$SHA256",
  "packageSha256": "$SHA256",
  "mandatory": false,
  "releaseNotes": [
    "Full app update package. Local MongoDB volumes and uploads are preserved."
  ]
}
JSON

rm -rf "$WORK_DIR"
echo "Update bundle created:"
echo "  $OUT_DIR/$PACKAGE_NAME"
echo "  $OUT_DIR/$PACKAGE_NAME.sha256"
echo "  $OUT_DIR/aws-update-manifest.json"
