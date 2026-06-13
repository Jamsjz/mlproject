#!/bin/bash

set -e

COMPOSE_CMD="docker compose"

# ─── Colors ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info()    { echo -e "${BLUE}[INFO]${NC}  $1"; }
log_success() { echo -e "${GREEN}[OK]${NC}    $1"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ─── Check prerequisites ───────────────────────────────────────────────────────
check_dependencies() {
  log_info "Checking dependencies..."

  if ! command -v docker &>/dev/null; then
    log_error "Docker is not installed or not in PATH."
  fi

  if ! docker compose version &>/dev/null 2>&1; then
    log_error "Docker Compose plugin (v2) is required. Run: docker compose version"
  fi

  log_success "Docker and Docker Compose are available."
}

# ─── Prepare .env ─────────────────────────────────────────────────────────────
prepare_env() {
  if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
      log_warn ".env not found. Copying from .env.example..."
      cp .env.example .env
      log_success ".env created. Review and update values before production use."
    else
      log_error ".env and .env.example not found. Cannot continue."
    fi
  else
    log_success ".env file found."
  fi
}

# ─── Prepare directories ──────────────────────────────────────────────────────
prepare_dirs() {
  ML_PATH=$(grep -E '^ML_MODELS_PATH=' .env 2>/dev/null | cut -d '=' -f2 | tr -d '"' | tr -d "'" || echo "ml/models")
  ML_PATH="${ML_PATH:-ml/models}"
  if [ ! -d "$ML_PATH" ]; then
    log_warn "Directory '$ML_PATH' not found. Creating..."
    mkdir -p "$ML_PATH"
    log_success "Directory '$ML_PATH' created."
  else
    log_success "Directory '$ML_PATH' found."
  fi
}

# ─── Start ────────────────────────────────────────────────────────────────────
start() {
  prepare_dirs
  log_info "Building and starting services..."
  $COMPOSE_CMD up --build -d
  log_success "Services are up."
  $COMPOSE_CMD ps
}

# ─── Stop ─────────────────────────────────────────────────────────────────────
stop() {
  log_info "Stopping services..."
  $COMPOSE_CMD down
  log_success "Services stopped."
}

# ─── Logs ─────────────────────────────────────────────────────────────────────
logs() {
  $COMPOSE_CMD logs -f
}

# ─── Restart ──────────────────────────────────────────────────────────────────
restart() {
  log_info "Restarting services..."
  $COMPOSE_CMD restart
  log_success "Services restarted."
}

# ─── Status ───────────────────────────────────────────────────────────────────
status() {
  $COMPOSE_CMD ps
}

# ─── Help ─────────────────────────────────────────────────────────────────────
usage() {
  echo ""
  echo "Usage: ./setup.sh [COMMAND]"
  echo ""
  echo "Commands:"
  echo "  start     Build and start all services (default)"
  echo "  stop      Stop and remove containers"
  echo "  restart   Restart all services"
  echo "  logs      Follow container logs"
  echo "  status    Show running containers"
  echo "  help      Show this help message"
  echo ""
}

# ─── Main ─────────────────────────────────────────────────────────────────────
check_dependencies
prepare_env

case "${1:-start}" in
  start)   start ;;
  stop)    stop ;;
  restart) restart ;;
  logs)    logs ;;
  status)  status ;;
  help)    usage ;;
  *)
    log_error "Unknown command: $1. Run './setup.sh help' for usage."
    ;;
esac
