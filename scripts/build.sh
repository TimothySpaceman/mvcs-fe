#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"
IMAGE_NAME="mvcs-frontend"
VERSION=$(jq -r '.version' "$REPO_DIR/package.json")

echo "==> Ensuring env variables..."
bash "$SCRIPT_DIR/ensure_env.sh"

echo "==> Building image '${IMAGE_NAME}:${VERSION}'..."
docker build -t "${IMAGE_NAME}:${VERSION}" -f "$REPO_DIR/Dockerfile" "$REPO_DIR"

echo "==> Build complete: ${IMAGE_NAME}:${VERSION}"