#!/usr/bin/env bash
# ============================================================
# start.sh — Planet Analog Search Engine
# NASA Space Apps Challenge 2026
# ============================================================
# Uso:
#   ./start.sh          → levanta backend + frontend juntos
#   ./start.sh backend  → solo backend  (puerto 8000)
#   ./start.sh frontend → solo frontend (puerto 5173)
#   ./start.sh stop     → mata ambos procesos
# ============================================================

set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT/backend"
FRONTEND_DIR="$ROOT/frontend"
BACKEND_PORT=8000
FRONTEND_PORT=5173
PID_FILE="$ROOT/.pids"

# ─── Colores ──────────────────────────────────────────────────
CYAN='\033[0;36m'
AMBER='\033[0;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
RESET='\033[0m'

banner() {
  echo ""
  echo -e "${CYAN}  ◈ PLANET ANALOG SEARCH ENGINE${RESET}"
  echo -e "${AMBER}    NASA Space Apps Challenge 2026${RESET}"
  echo ""
}

# ─── Verificaciones previas ───────────────────────────────────
check_python() {
  if ! command -v python3 &>/dev/null; then
    echo -e "${RED}ERROR: python3 no encontrado. Instala Python 3.11+${RESET}"
    exit 1
  fi
  PY_VER=$(python3 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
  echo -e "  ${GREEN}✓${RESET} Python $PY_VER"
}

check_node() {
  if ! command -v node &>/dev/null; then
    echo -e "${RED}ERROR: node no encontrado. Instala Node 18+${RESET}"
    exit 1
  fi
  NODE_VER=$(node --version)
  echo -e "  ${GREEN}✓${RESET} Node $NODE_VER"
}

check_deps_backend() {
  if ! python3 -c "import fastapi" &>/dev/null; then
    echo -e "${AMBER}  ⚠ Dependencias backend no instaladas. Instalando...${RESET}"
    pip install -r "$BACKEND_DIR/requirements.txt" -q
    echo -e "  ${GREEN}✓${RESET} Dependencias backend instaladas"
  else
    echo -e "  ${GREEN}✓${RESET} Dependencias backend OK"
  fi
}

check_deps_frontend() {
  if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo -e "${AMBER}  ⚠ node_modules no encontrado. Ejecutando npm install...${RESET}"
    cd "$FRONTEND_DIR" && npm install -q
    echo -e "  ${GREEN}✓${RESET} Dependencias frontend instaladas"
  else
    echo -e "  ${GREEN}✓${RESET} Dependencias frontend OK"
  fi
}

# ─── Funciones de inicio ──────────────────────────────────────
start_backend() {
  echo -e "\n${CYAN}▶ Iniciando Backend...${RESET}"
  cd "$BACKEND_DIR"
  python3 -m uvicorn main:app \
    --host 127.0.0.1 \
    --port $BACKEND_PORT \
    --reload \
    --log-level info &
  BACKEND_PID=$!
  echo $BACKEND_PID >> "$PID_FILE"
  echo -e "  ${GREEN}✓${RESET} Backend en http://localhost:$BACKEND_PORT  (PID $BACKEND_PID)"
  echo -e "    ${CYAN}→ Docs: http://localhost:$BACKEND_PORT/docs${RESET}"
}

start_frontend() {
  echo -e "\n${CYAN}▶ Iniciando Frontend...${RESET}"
  cd "$FRONTEND_DIR"
  npm run dev &
  FRONTEND_PID=$!
  echo $FRONTEND_PID >> "$PID_FILE"
  echo -e "  ${GREEN}✓${RESET} Frontend en http://localhost:$FRONTEND_PORT  (PID $FRONTEND_PID)"
}

stop_all() {
  if [ -f "$PID_FILE" ]; then
    echo -e "${AMBER}▶ Deteniendo procesos...${RESET}"
    while read -r pid; do
      kill "$pid" 2>/dev/null && echo -e "  Detenido PID $pid" || true
    done < "$PID_FILE"
    rm -f "$PID_FILE"
    echo -e "${GREEN}✓ Todo detenido.${RESET}"
  else
    echo -e "${AMBER}No hay procesos registrados en .pids${RESET}"
    # Intentar matar por puerto de todas formas
    lsof -ti tcp:$BACKEND_PORT | xargs kill 2>/dev/null || true
    lsof -ti tcp:$FRONTEND_PORT | xargs kill 2>/dev/null || true
  fi
  exit 0
}

# ─── Main ─────────────────────────────────────────────────────
banner
MODE="${1:-both}"

case "$MODE" in
  stop)
    stop_all
    ;;
  backend)
    echo -e "${CYAN}Verificando entorno...${RESET}"
    check_python
    check_deps_backend
    # Limpiar puerto si está ocupado
    lsof -ti tcp:$BACKEND_PORT | xargs kill 2>/dev/null || true
    sleep 1
    rm -f "$PID_FILE"
    start_backend
    echo -e "\n${GREEN}✓ Backend listo. Ctrl+C para detener.${RESET}\n"
    wait
    ;;
  frontend)
    echo -e "${CYAN}Verificando entorno...${RESET}"
    check_node
    check_deps_frontend
    rm -f "$PID_FILE"
    start_frontend
    echo -e "\n${GREEN}✓ Frontend listo. Ctrl+C para detener.${RESET}\n"
    wait
    ;;
  both|*)
    echo -e "${CYAN}Verificando entorno...${RESET}"
    check_python
    check_node
    check_deps_backend
    check_deps_frontend

    # Limpiar puertos ocupados
    lsof -ti tcp:$BACKEND_PORT | xargs kill 2>/dev/null || true
    lsof -ti tcp:$FRONTEND_PORT | xargs kill 2>/dev/null || true
    sleep 1
    rm -f "$PID_FILE"

    start_backend

    # Esperar a que el backend esté listo antes de lanzar el frontend
    echo -e "\n  ${AMBER}Esperando que el backend levante...${RESET}"
    for i in {1..15}; do
      if curl -s "http://localhost:$BACKEND_PORT/api/v1/health" &>/dev/null; then
        echo -e "  ${GREEN}✓${RESET} Backend saludable (${i}s)"
        break
      fi
      sleep 1
    done

    start_frontend

    echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
    echo -e "${GREEN}  ✓ APLICACIÓN LISTA${RESET}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
    echo -e "  ${CYAN}→ Dashboard:  http://localhost:$FRONTEND_PORT${RESET}"
    echo -e "  ${CYAN}→ API Docs:   http://localhost:$BACKEND_PORT/docs${RESET}"
    echo -e "  ${CYAN}→ Health:     http://localhost:$BACKEND_PORT/api/v1/health${RESET}"
    echo ""
    echo -e "  ${AMBER}Presiona Ctrl+C para detener ambos procesos.${RESET}"
    echo ""

    # Capturar Ctrl+C para matar ambos
    trap 'echo -e "\n${AMBER}Deteniendo...${RESET}"; kill $(cat "$PID_FILE" 2>/dev/null) 2>/dev/null; rm -f "$PID_FILE"; exit 0' INT TERM

    wait
    ;;
esac
