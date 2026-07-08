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
sed -i.bak "s/^APP_VERSION=.*/APP_VERSION=$VERSION/" "$WORK_DIR/.env.local-school.example"
rm -f "$WORK_DIR/.env.local-school.example.bak"

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

# ----- Delta "app bundle": the swappable app code (React dist + backend JS) -----
# This is what delta updates download and apply in place, without reinstalling
# the Electron/MongoDB runtime. node_modules is intentionally excluded: the
# launcher points the bundle's backend at the baseline install's node_modules
# via NODE_PATH, so app-only updates stay small.
APP_BUNDLE_NAME="shiksha-sarthi-app-$VERSION.zip"
APP_WORK="$OUT_DIR/app-bundle"
rm -rf "$APP_WORK"
mkdir -p "$APP_WORK"

if [[ ! -f "$ROOT_DIR/dist/index.html" ]]; then
  echo "ERROR: dist/index.html not found — run 'npm run build' before packaging the app bundle." >&2
  exit 1
fi
cp -r "$ROOT_DIR/dist" "$APP_WORK/dist"
cp -r "$ROOT_DIR/backend" "$APP_WORK/backend"
cp -r "$ROOT_DIR/question_bank" "$APP_WORK/question_bank"
# Strip everything the runtime provides from the baseline or creates at runtime.
rm -rf \
  "$APP_WORK/backend/node_modules" \
  "$APP_WORK/backend/data" \
  "$APP_WORK/backend/.env" \
  "$APP_WORK/backend/backups" \
  "$APP_WORK/backend/uploads" \
  "$APP_WORK/backend/updates" \
  "$APP_WORK/question_bank/textbooks"

(cd "$APP_WORK" && zip -qr "$OUT_DIR/$APP_BUNDLE_NAME" .)
APP_SHA256="$(sha256sum "$OUT_DIR/$APP_BUNDLE_NAME" | awk '{print $1}')"
printf "%s  %s\n" "$APP_SHA256" "$APP_BUNDLE_NAME" > "$OUT_DIR/$APP_BUNDLE_NAME.sha256"
rm -rf "$APP_WORK"

echo "App (delta) bundle created:"
echo "  $OUT_DIR/$APP_BUNDLE_NAME"
echo "  $OUT_DIR/$APP_BUNDLE_NAME.sha256"
