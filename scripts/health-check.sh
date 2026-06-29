#!/usr/bin/env sh
set -eu

curl -sS http://localhost:6050/health
echo
curl -sS http://localhost:6050/app/version
echo
curl -sS http://localhost:6050/app/status
echo
