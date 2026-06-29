#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERSION="${1:-$(node -p "require('$ROOT_DIR/backend/package.json').version")}"
CHANNEL="${RELEASE_CHANNEL:-stable}"
RELEASE_DATE="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
OUT_DIR="$ROOT_DIR/dist-release"
STAGING="$OUT_DIR/staging/shiksha-sarthi-$VERSION"
PACKAGE="shiksha-sarthi-$VERSION.zip"

rm -rf "$OUT_DIR/staging"
mkdir -p "$STAGING" "$OUT_DIR"

rsync -a --no-owner --no-group "$ROOT_DIR/" "$STAGING/" \
  --exclude ".git" \
  --exclude ".env" \
  --exclude "node_modules" \
  --exclude "backend/node_modules" \
  --exclude "backend/.env" \
  --exclude "backend/backups" \
  --exclude "backend/uploads" \
  --exclude "backend/data/audio-cache" \
  --exclude "uploads" \
  --exclude "mongodb/data" \
  --exclude "shikshasarthi-launcher/data" \
  --exclude "k8s" \
  --exclude "dist-release" \
  --exclude "dist" \
  --exclude "QuestionGenerator/VQG" \
  --exclude "question_bank/textbooks"

(cd "$OUT_DIR/staging" && zip -qr "../$PACKAGE" "shiksha-sarthi-$VERSION")
SHA256="$(sha256sum "$OUT_DIR/$PACKAGE" | awk '{print $1}')"
printf "%s  %s\n" "$SHA256" "$PACKAGE" > "$OUT_DIR/shiksha-sarthi-$VERSION.sha256"

cat > "$OUT_DIR/manifest.json" <<JSON
{
  "app": "ShikshaSarthi",
  "version": "$VERSION",
  "releaseDate": "$RELEASE_DATE",
  "packageFile": "$PACKAGE",
  "sha256": "$SHA256",
  "channel": "$CHANNEL",
  "notes": []
}
JSON

rm -rf "$OUT_DIR/staging"
echo "Release package created:"
echo "  $OUT_DIR/$PACKAGE"
echo "  $OUT_DIR/shiksha-sarthi-$VERSION.sha256"
echo "  $OUT_DIR/manifest.json"
