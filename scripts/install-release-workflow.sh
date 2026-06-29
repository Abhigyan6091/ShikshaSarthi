#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
mkdir -p "$ROOT_DIR/.github/workflows"
cp "$ROOT_DIR/docs/ci-cd/release-workflow.yml" "$ROOT_DIR/.github/workflows/release.yml"
echo "Installed .github/workflows/release.yml"
