#!/usr/bin/env sh
set -eu

if [ ! -f .env ]; then
  cp .env.local-school.example .env
  echo "Created .env from .env.local-school.example"
fi

docker compose up -d --build
docker compose ps
echo "Open http://localhost:6050"
