# Makefile — Planet Analog Search Engine
# NASA Space Apps Challenge 2026
# ============================================================

BACKEND_DIR := backend
FRONTEND_DIR := frontend
PYTHON := python3
UVICORN_HOST := 127.0.0.1
UVICORN_PORT := 8000

.PHONY: help install-backend install-frontend install backend backend-prod frontend dev start stop check-backend test-search clean

help: ## Muestra ayuda
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install-backend: ## Instala dependencias Python del backend
	cd $(BACKEND_DIR) && pip install -r requirements.txt

install-frontend: ## Instala dependencias Node del frontend
	cd $(FRONTEND_DIR) && npm install

install: install-backend install-frontend ## Instala todas las dependencias

backend: ## Levanta backend FastAPI en localhost:8000 (con hot-reload)
	cd $(BACKEND_DIR) && $(PYTHON) -m uvicorn main:app --host $(UVICORN_HOST) --port $(UVICORN_PORT) --reload

backend-prod: ## Levanta backend sin hot-reload (demo)
	cd $(BACKEND_DIR) && $(PYTHON) -m uvicorn main:app --host $(UVICORN_HOST) --port $(UVICORN_PORT)

frontend: ## Levanta frontend Vite en localhost:5173
	cd $(FRONTEND_DIR) && npm run dev

dev: ## Levanta backend en segundo plano + frontend (usa start.sh para mejor control)
	@echo "Levantando backend en background..."
	cd $(BACKEND_DIR) && $(PYTHON) -m uvicorn main:app --host $(UVICORN_HOST) --port $(UVICORN_PORT) --reload &
	@echo "Levantando frontend..."
	cd $(FRONTEND_DIR) && npm run dev

check-backend: ## Verifica el health check del backend
	@curl -s http://localhost:8000/api/v1/health | python3 -m json.tool

test-search: ## Prueba el endpoint de búsqueda (SC-002a: target lunar)
	@curl -s -X POST http://localhost:8000/api/v1/analogs/search \
		-H "Content-Type: application/json" \
		-d '{"target":{"tempMax":-20,"tempMin":-230,"pressure":0.001,"solarRad":14,"uvIndex":22,"loc":5,"friction":0.48,"cohesion":0.30},"top_n":5}' \
		| python3 -m json.tool

start: ## ★ Levanta backend + frontend juntos con un solo comando (recomendado)
	@bash start.sh

stop: ## Detiene todos los procesos lanzados por start.sh
	@bash start.sh stop

clean: ## Limpia caches Python
	find $(BACKEND_DIR) -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find $(BACKEND_DIR) -name "*.pyc" -delete 2>/dev/null || true
