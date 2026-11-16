# Research: Planet Analog Search Engine

**Branch**: `001-planet-analog-search` | **Date**: 2026-11-15
**Purpose**: Resolver todas las decisiones técnicas antes del diseño. Sin NEEDS CLARIFICATION abiertos.

---

## D-001: Algoritmo Euclidiano Ponderado con Min-Max

**Decision**: Distancia euclidiana ponderada con normalización Min-Max. Amplitud térmica (ΔT = TempMax−TempMin) como variable derivada con peso 3.0.

**Rationale**: Euclidiana es interpretable por científicos y jueces. Min-Max garantiza que variables con distintas unidades contribuyan por peso, no por magnitud de escala. Para 1000 registros, O(n) es suficiente — latencia esperada < 5ms en CPU.

**Fórmula**:
```
x_norm_i = (x_i - x_min) / (x_max - x_min + 1e-9)
d(target, i) = sqrt( Σ w_j * (x_norm_target_j - x_norm_i_j)² )
similarity_score = 1 - (d / sqrt(Σ w_j))

weights: thermal_amp=3.0, pressure=2.0, solarRad=1.5, uvIndex=1.5, loc=1.0, friction=1.0, cohesion=0.5
```

**Alternatives considered**: Coseno (no captura magnitud absoluta — rechazado), Manhattan (menos preciso en espacio multidimensional — rechazado), sklearn KNN (dependencia innecesaria — rechazado).

---

## D-002: Mock Dataset — seed=42, Inyección de 4 Puntos Obligatorios

**Decision**: `generate_mock_data()` en `backend/infrastructure/mock_data_generator.py`. `random.seed(42)` para reproducibilidad. Distribución: 400 registros en Perú/Atacama (Lat: -22° a -8°, Lng: -76° a -66°), 600 globales. Los 4 obligatorios se inyectan como primeros 4 items.

**Rationale**: seed=42 garantiza rangos Min-Max idénticos entre reinicios → scores deterministas (SC-002a/b/c). Inyección primero = garantía de presencia sin depender del generador aleatorio.

**Rangos de generación**:

| Variable | Perú/Atacama | Global |
|----------|-------------|--------|
| tempMax | 10..35°C | -30..50°C |
| tempMin | -20..5°C | -60..25°C |
| pressure | 550..1013 hPa | 870..1013 hPa |
| solarRad | 5.0..9.0 | 1.0..8.0 |
| uvIndex | 8..20 | 0..15 |
| loc | 5..200 g/kg | 10..400 g/kg |
| friction | 0.3..0.9 | 0.2..0.95 |
| cohesion | 0.1..0.8 | 0.1..0.9 |

**Alternatives considered**: CSV estático (viola "generar dinámicamente" — rechazado), numpy (dependencia pesada sin ventaja — rechazado).

---

## D-003: FastAPI Lifespan + Singleton Repository

**Decision**: `InMemoryAnalogRepository` inicializado en `lifespan` context manager (FastAPI >= 0.95). Inyectado vía `app.state` y `Depends()`.

**Rationale**: `lifespan` es el patrón moderno (`@app.on_event` está deprecado). Singleton read-only = thread-safe. `Depends(get_repo)` implementa DIP — routers reciben `IAnalogRepository`, no la implementación.

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    repo = InMemoryAnalogRepository()
    repo.initialize()   # genera los 1000 registros
    app.state.analog_repo = repo
    yield
```

---

## D-004: CV Mock — asyncio.sleep + Fixture Determinista

**Decision**: `await asyncio.sleep(float(os.environ.get("CV_MOCK_DELAY_SECONDS", "2.0")))` en endpoint async. Output = JSON fixture fijo siempre (Constitution §IV).

**Rationale**: `asyncio.sleep` no bloquea el event loop. Variable de entorno permite override en demos rápidas. `time.sleep` bloquearía Uvicorn — rechazado.

---

## D-005: Frontend — React Hooks sin Redux

**Decision**: React 18 + hooks nativos. Custom hooks en `frontend/src/application/hooks/`: `useAnalogSearch`, `useCVAnalyze`, `useAnalogList`. Sin Redux/Zustand.

**State shape**:
```
{ searchParams, searchResults, selectedAnalog, allAnalogs, cvStatus, cvResult }
```

**Rationale**: 3 user stories no justifican Redux. Custom hooks encapsulan lógica HTTP y mantienen separación application/presentation (Clean Architecture Frontend).

---

## D-006: Leaflet — CircleMarker + Canvas Renderer

**Decision**: `L.CircleMarker` con `L.canvas()` renderer para los 996 puntos generados. `L.Marker` con ícono custom amber para los 4 obligatorios. Librería: `react-leaflet` v4 (compatible con React 18 Strict Mode).

**Rationale**: Canvas renderer = 1 elemento DOM para 1000 círculos → cumple SC-004 (< 3s). `react-leaflet` v3 tiene bugs con React 18 Strict Mode.

**Tile fallback**: ESRI Dark Canvas primario. `https://tile.openstreetmap.org/{z}/{x}/{y}.png` como fallback (SC-007).

---

## D-007: Monorepo Simple — Makefile sin Turborepo/Nx

**Decision**: Dos directorios raíz (`backend/`, `frontend/`). `Makefile` en raíz para comandos unificados. Sin Docker (A-004).

```makefile
dev-backend:  cd backend && uvicorn main:app --reload --port 8000
dev-frontend: cd frontend && npm run dev
dev:          make -j2 dev-backend dev-frontend
install:      pip install -r backend/requirements.txt && npm --prefix frontend install
```

---

## D-008: TypeScript en Frontend

**Decision**: Sí. `.tsx` para componentes React, `.ts` para tipos/services/hooks. Vite + TypeScript template oficial.

**Rationale**: Tipos estáticos para `AnalogLocation`, `SpaceTarget`, `AnalogSearchResult`, `CVInferenceResult` evitan bugs de integración con la API.

---

## Unknowns Resueltos

| Unknown | Resolución |
|---------|-----------|
| Normalización antes o después de pesos | Antes. Pesos sobre valores normalizados. |
| Top-N configurable | N=5 constante `TOP_N = 5` en `use_cases/analog_search_service.py` |
| Paginación de 1000 registros | `GET /api/v1/analogs?page=1&size=200` (5 páginas). Frontend carga en paralelo. |
| IDs format | UUID4. 4 obligatorios tienen UUIDs fijos hardcodeados. |
| CORS config | `CORSMiddleware` con `allow_origins=["http://localhost:5173"]` |
