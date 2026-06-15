#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG_DIR="$ROOT_DIR/../spacegate-admin-front"

cd "$ROOT_DIR"

log() {
  printf '\n==> %s\n' "$1"
}

need_file() {
  local path="$1"
  local hint="$2"

  if [[ ! -f "$path" ]]; then
    printf 'Missing required file: %s\n' "$path" >&2
    printf '%s\n' "$hint" >&2
    exit 1
  fi
}

need_file "$CONFIG_DIR/package.json" \
  "Expected sibling checkout: ../spacegate-admin-front"

if [[ "${INSTALL_DEPS:-0}" == "1" ]]; then
  log "Installing component dependencies"
  npm --prefix "$CONFIG_DIR" install

  log "Installing root dependencies"
  npm install
else
  if [[ ! -d "$CONFIG_DIR/node_modules" || ! -d "$ROOT_DIR/node_modules" ]]; then
    cat >&2 <<'EOF'
Dependencies are not installed.

Run one of:
  INSTALL_DEPS=1 npm run local:test
  npm --prefix ../spacegate-admin-front install && npm install && npm run local:test
EOF
    exit 1
  fi
fi

log "Type checking Vue and TypeScript"
npm exec -- vue-tsc --noEmit

log "Building frontend"
npm run build-all

log "Local test completed"
printf 'To start the dev server: npm run dev\n'
