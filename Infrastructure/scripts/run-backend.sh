#!/usr/bin/env bash
# Loads the root .env into the environment, then starts the Spring Boot backend.
# Spring Boot does not read .env on its own; this wrapper bridges that.
#   ./Infrastructure/scripts/run-backend.sh
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
[ -f "$ROOT/.env" ] || { echo "Missing $ROOT/.env — copy .env.example to .env first."; exit 1; }

set -a
# shellcheck disable=SC1090
source <(tr -d '\r' < "$ROOT/.env")   # tolerate CRLF line endings
# Layer .env.local on top (same order as the AI service / Vite), if present.
[ -f "$ROOT/.env.local" ] && source <(tr -d '\r' < "$ROOT/.env.local")
set +a

echo "Loaded env; starting backend on port ${BACKEND_PORT:-8080}..."
cd "$ROOT/Backend"
exec mvn spring-boot:run
