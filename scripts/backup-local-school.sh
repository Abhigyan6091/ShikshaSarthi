#!/usr/bin/env sh
set -eu

curl -sS -X POST \
  -H "Content-Type: application/json" \
  -H "x-user-role: superadmin" \
  http://localhost:6050/api/backup/create
echo
