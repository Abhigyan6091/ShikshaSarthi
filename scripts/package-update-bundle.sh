#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERSION="${1:-$(node -p "require('$ROOT_DIR/backend/package.json').version")}"
CHANNEL="${RELEASE_CHANNEL:-stable}"
RELEASE_DATE="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
OUT_DIR="$ROOT_DIR/dist-release"
WORK_DIR="$OUT_DIR/update-bundle"
PACKAGE_NAME="shiksha-sarthi-update-$VERSION.zip"

rm -rf "$WORK_DIR"
mkdir -p "$WORK_DIR" "$OUT_DIR"
cp "$ROOT_DIR/.env.local-school.example" "$WORK_DIR/.env.local-school.example"

cat > "$WORK_DIR/release-metadata.json" <<JSON
{
  "app": "ShikshaSarthi",
  "version": "$VERSION",
  "channel": "$CHANNEL",
  "releaseDate": "$RELEASE_DATE",
  "port": 6050,
  "packageType": "desktop-installer-update",
  "preserves": [
    "local_mongodb_data",
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
    "Desktop installer release. Local MongoDB data, credentials, uploads, and backups are preserved in the app data directory."
  ]
}
JSON

rm -rf "$WORK_DIR"
echo "Update bundle created:"
echo "  $OUT_DIR/$PACKAGE_NAME"
echo "  $OUT_DIR/$PACKAGE_NAME.sha256"
echo "  $OUT_DIR/aws-update-manifest.json"
