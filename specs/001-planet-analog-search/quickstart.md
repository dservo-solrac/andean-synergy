# Quickstart & Validation Guide: Planet Analog Search Engine

**Branch**: `001-planet-analog-search` | **Date**: 2026-11-15
**Purpose**: Guía de arranque y verificación end-to-end. Ver contratos en `contracts/api-contracts.md`.

---

## Prerequisitos

Python 3.11+, Node.js 18+, npm 9+

---

## HITO 1 — Backend (Python/FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**`requirements.txt`**: `fastapi>=0.110.0`, `uvicorn[standard]>=0.29.0`, `pydantic>=2.6.0`, `python-multipart>=0.0.9`

**Salida esperada en startup**:
```
INFO: [ANALOG ENGINE] Generating 1000 analog locations... (seed=42)
INFO: [ANALOG ENGINE] Injecting 4 mandatory key analogs...
INFO: [ANALOG ENGINE] Dataset ready: 1000 records loaded in memory.
INFO: Uvicorn running on http://127.0.0.1:8000
```

### Checks Hito 1

**Check 1 — Health** (`GET /api/v1/health`):
```bash
curl http://localhost:8000/api/v1/health
# Esperado: {"status": "ok", "records_loaded": 1000}
```

**Check 2 — 4 puntos obligatorios** (`GET /api/v1/analogs?page=1&size=4`):
```bash
curl "http://localhost:8000/api/v1/analogs?page=1&size=4"
# Esperado en items[0..3].name: La Joya, Altiplano, Andagua, Yungay
```

**Check 3 — SC-002a: Marte → Mar de Cuarzo** (`POST /api/v1/analogs/search`):
```bash
curl -X POST http://localhost:8000/api/v1/analogs/search \
  -H "Content-Type: application/json" \
  -d '{"tempMax":-14,"tempMin":-82,"pressure":0.636,"solarRad":5.9,"uvIndex":0,"loc":10,"friction":0.6,"cohesion":0.5}'
```
✅ `results[0].analog.name == "Mar de Cuarzo (Pampas de La Joya)"` | `similarity_score >= 0.80` | `computation_time_ms < 1000`

**Check 4 — SC-002c: Alta Fricción → Andagua** (`POST /api/v1/analogs/search`):
```bash
curl -X POST http://localhost:8000/api/v1/analogs/search \
  -H "Content-Type: application/json" \
  -d '{"tempMax":22,"tempMin":2,"pressure":950,"solarRad":6.5,"uvIndex":12,"loc":45,"friction":0.85,"cohesion":0.70}'
```
✅ `results[0].analog.name == "Valle de los Volcanes de Andagua"`

**Check 5 — SC-002b: CV Mock → Altiplano** (`POST /api/v1/cv/analyze`):
```bash
# Usar cualquier JPG valido <= 10MB
curl -X POST http://localhost:8000/api/v1/cv/analyze -F "file=@imagen_lunar.jpg"
# Esperado siempre: {"tempMax":-20,"tempMin":-230,"pressure":0,"solarRad":14,"uvIndex":22,"loc":5,"friction":0.48,"cohesion":0.30,"model":"NASA-IBM Lunar Foundation Model v1.0-mock","confidence":0.87}
# Luego buscar con esos params: Top-1 = "Altiplano (Laguna Salinas / Aguada Blanca)"
```

**Check 6 — Validación 422** (input inválido):
```bash
curl -X POST http://localhost:8000/api/v1/analogs/search \
  -H "Content-Type: application/json" \
  -d '{"tempMax":999,"tempMin":-82,"pressure":0.636,"solarRad":5.9,"uvIndex":0,"loc":10}'
# Esperado: HTTP 422 con detail descriptivo
```

---

## HITO 2 — Frontend (React/Leaflet)

```bash
cd frontend && npm install && npm run dev
# Abre: http://localhost:5173
# PREREQUISITO: Backend en localhost:8000
```

### Checks Hito 2

**Check 7 — Mapa 1000 marcadores (SC-004)**:
- Abrir `http://localhost:5173` en Chrome/Firefox
- Mapa con fondo ESRI Dark Canvas visible
- 1000 puntos en mapa global en < 3 segundos de carga
- 4 puntos en Perú/Chile con ícono **amber/dorado** (resto cyan)

**Check 8 — HUD Holográfico (z-index 1005)**:
- Hover sobre cualquier marcador
- Tooltip muestra: Nombre, Lat/Lon (4 decimales), ΔT en °C, LOC en g/kg
- DevTools → Inspect: `z-index == 1005`

**Check 9 — Búsqueda + Matriz Comparativa**:
- Ingresar params Marte (TempMax: -14, TempMin: -82, ...)
- Top-1 = "Mar de Cuarzo (Pampas de La Joya)"
- Clic en Top-1 → Matriz Comparativa con 4 barras (cyan=Target, amber=Análogo)

**Check 10 — Upload CV + Autocompletado**:
- Drag & drop JPG/PNG al panel CV
- Spinner ~2 segundos
- Formulario autocompletado con params lunares
- Búsqueda automática → Top-1 = "Altiplano (Laguna Salinas / Aguada Blanca)"

**Check 11 — Consola Científica (cURL dinámico)**:
- Con análogo seleccionado → ver Consola Científica
- Bloque cURL con lat/lon del análogo seleccionado
- Endpoint: `https://power.larc.nasa.gov/api/temporal/daily/point`
- Fecha actual en formato YYYYMMDD

---

## Validación Clean Architecture (SC-006)

```bash
cd backend
grep -r "from infrastructure" domain/ && echo "VIOLATION!" || echo "PASS"
grep -r "from adapters" domain/ && echo "VIOLATION!" || echo "PASS"
# Ambos deben retornar PASS
```

---

## Referencia Rápida

| Documento | Ruta |
|-----------|------|
| Contratos API | `specs/001-planet-analog-search/contracts/api-contracts.md` |
| Data Model | `specs/001-planet-analog-search/data-model.md` |
| Research | `specs/001-planet-analog-search/research.md` |
