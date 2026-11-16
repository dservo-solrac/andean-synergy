# 🪐 Planet Analog Search Engine

**NASA Space Apps Challenge 2026** — Andean Synergy Team

Identifica análogos terrestres para misiones lunares y marcianas mediante distancia euclidiana ponderada (Min-Max) sobre 1000 ubicaciones globales en memoria. Dashboard Sci-Fi con mapa Leaflet, mock del NASA-IBM Lunar Foundation Model y Consola Científica con cURL dinámico.

---

## Prerequisitos

| Componente | Versión |
|-----------|---------|
| Python | 3.11+ |
| Node.js | 18+ |
| npm | 9+ |

---

## Instalación

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd andean_synergy

# 2. Instalar dependencias backend
pip install -r backend/requirements.txt

# 3. Instalar dependencias frontend
cd frontend && npm install && cd ..
```

---

## Arrancar la aplicación

Usar dos terminales:

```bash
# Terminal 1 — Backend (puerto 8000)
make backend
# equivalente a: cd backend && uvicorn main:app --reload --port 8000

# Terminal 2 — Frontend (puerto 5173)
make frontend
# equivalente a: cd frontend && npm run dev
```

Abrir: **http://localhost:5173**

---

## Verificación rápida de los 3 casos de prueba

### SC-002a — Búsqueda marciana → La Joya (Rank 1, score ≥ 0.80)

```bash
curl -s -X POST http://localhost:8000/api/v1/analogs/search \
  -H 'Content-Type: application/json' \
  -d '{
    "target": {
      "tempMax": -14, "tempMin": -82, "pressure": 0.636,
      "solarRad": 5.9, "uvIndex": 0, "loc": 10,
      "friction": 0.6, "cohesion": 0.5
    },
    "top_n": 3
  }' | python3 -m json.tool
# Esperado: Rank 1 = "Mar de Cuarzo (Pampas de La Joya)", score ≥ 0.80
```

### SC-002b — IA Multimodal (fixture CV) → Altiplano (Rank 1, score = 1.0)

```bash
curl -s -X POST http://localhost:8000/api/v1/analogs/search \
  -H 'Content-Type: application/json' \
  -d '{
    "target": {
      "tempMax": -20, "tempMin": -230, "pressure": 0.0,
      "solarRad": 14, "uvIndex": 22, "loc": 5,
      "friction": 0.48, "cohesion": 0.30
    },
    "top_n": 3
  }' | python3 -m json.tool
# Esperado: Rank 1 = "Altiplano (Laguna Salinas / Aguada Blanca)", score = 1.0
```

### SC-002c — Terrenos basálticos → Andagua (Rank 1, score = 1.0)

```bash
curl -s -X POST http://localhost:8000/api/v1/analogs/search \
  -H 'Content-Type: application/json' \
  -d '{
    "target": {
      "tempMax": 22, "tempMin": 2, "pressure": 950,
      "solarRad": 6.5, "uvIndex": 12, "loc": 45,
      "friction": 0.85, "cohesion": 0.70
    },
    "top_n": 3
  }' | python3 -m json.tool
# Esperado: Rank 1 = "Valle de los Volcanes de Andagua", score = 1.0
```

---

## Endpoints disponibles

| Método | URL | Descripción |
|--------|-----|-------------|
| GET | `/api/v1/health` | Estado del servicio + conteo de análogos |
| GET | `/api/v1/analogs/?page=1&page_size=200` | Listar análogos paginados (5 páginas × 200) |
| POST | `/api/v1/analogs/search` | Búsqueda euclidiana top-N |
| POST | `/api/v1/cv/analyze` | Mock NASA-IBM Lunar Foundation Model (~2s) |

Documentación interactiva: http://localhost:8000/docs

---

## Arquitectura

```
backend/
├── domain/          # Entidades puras (Pydantic) + Protocolos DIP
├── use_cases/       # Lógica de negocio (Strategy Pattern)
├── adapters/        # Routers FastAPI
└── infrastructure/  # Mock data, algoritmo euclidiano, CV mock

frontend/src/
├── domain/          # Tipos TypeScript
├── application/     # Hooks React (useAnalogSearch, useCVAnalyze, useAnalogList)
├── infrastructure/  # Cliente HTTP (fetch)
└── presentation/    # Componentes React Sci-Fi
```

**Clean Architecture** verificable: ningún archivo en `domain/` importa de `infrastructure/` o `adapters/`.

---

## Stack técnico

- **Backend**: Python 3.11 + FastAPI 0.110 + Pydantic 2.6 + Uvicorn
- **Frontend**: React 18 + Vite 5.4 + TypeScript 5 + Tailwind CSS 3 + react-leaflet 4
- **Mapa**: Leaflet.js 1.9 + ESRI Dark Canvas (fallback: OpenStreetMap)
- **Datos**: 1000 registros en RAM (seed=42), Zero-Database

---

*NASA Space Apps Challenge 2026 — Planet Analog Search Engine v1.0*
