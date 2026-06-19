#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$REPO_DIR/.env"

REQUIRED_VARS=(
  "NEXT_PUBLIC_API_HOST"
)

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing ${ENV_FILE} — create it before building."
  exit 1
fi

MISSING=()
for var in "${REQUIRED_VARS[@]}"; do
  if ! grep -q "^${var}=" "$ENV_FILE"; then
    MISSING+=("$var")
  fi
done

if [ ${#MISSING[@]} -ne 0 ]; then
  echo "Missing variables in .env:"
  for v in "${MISSING[@]}"; do
    echo "  - $v"
  done
  exit 1
fi

echo "All env variables present."