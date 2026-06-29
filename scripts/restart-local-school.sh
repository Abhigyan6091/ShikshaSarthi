#!/usr/bin/env sh
set -eu

docker compose restart
docker compose ps
