# Tasks: Planet Analog Search Engine — Hito 1 Backend + Hito 2 Frontend

**Input**: specs/001-planet-analog-search/plan.md, spec.md, data-model.md, contracts/api-contracts.md

## Phase 1: Setup (Monorepo + Backend Scaffold)

- [X] T001 Crear estructura de directorios del monorepo (backend/, Makefile, .gitignore)
- [X] T002 Crear backend/requirements.txt con dependencias FastAPI, Pydantic, Uvicorn, python-multipart

## Phase 2: Foundational — Domain + Primera Tarea BLOQUEANTE

- [X] T003 Crear backend/infrastructure/mock_data_generator.py — generate_mock_data(seed=42), 4 puntos obligatorios
- [X] T004 Crear backend/domain/entities.py — AnalogLocation, SpaceTarget, AnalogSearchResult, CVInferenceResult
- [X] T005 Crear backend/domain/protocols.py — IAnalogRepository, ISimilarityAlgorithm, IVisionModelAdapter

## Phase 3: User Story 1 — Motor de Similitud (P1)

- [X] T006 [US1] Crear backend/infrastructure/in_memory_repository.py — InMemoryAnalogRepository impl IAnalogRepository
- [X] T007 [US1] Crear backend/infrastructure/euclidean_algorithm.py — EuclideanSimilarity impl ISimilarityAlgorithm (Min-Max, pesos)
- [X] T008 [US1] Crear backend/use_cases/analog_search_service.py — AnalogSearchService (Strategy Pattern)
- [X] T009 [US1] Crear backend/adapters/routers/analogs_router.py — POST /search + GET / paginado
- [X] T010 [US1] Crear backend/adapters/routers/health_router.py — GET /health

## Phase 4: User Story 2 — CV Mock NASA-IBM (P2)

- [X] T011 [US2] Crear backend/infrastructure/cv_mock_adapter.py — CVMockAdapter impl IVisionModelAdapter (asyncio.sleep + fixture)
- [X] T012 [US2] Crear backend/use_cases/cv_analysis_service.py — CVAnalysisService
- [X] T013 [US2] Crear backend/adapters/routers/cv_router.py — POST /cv/analyze multipart

## Phase 5: Integration — main.py + __init__.py + .gitignore

- [X] T014 Crear todos los backend/__init__.py (domain, use_cases, adapters, adapters/routers, infrastructure)
- [X] T015 Crear backend/main.py — FastAPI app + lifespan + CORS + routers
- [X] T016 Crear Makefile en raíz del monorepo
- [X] T017 Crear .gitignore en raíz

## Phase 6: Polish — Validación

- [X] T018 Levantar servidor FastAPI y ejecutar los 6 checks del quickstart.md

## Phase 7: Frontend — Setup Vite 5 + React 18 + Tailwind 3 + Leaflet

- [X] T019 Setup Vite 5.4 + React 18 + TypeScript 5 + Tailwind 3 + react-leaflet 4 (package.json, tsconfig, postcss)
- [X] T020 Configurar vite.config.ts con proxy /api → localhost:8000 y tailwind.config.js
- [X] T021 Crear frontend/src/index.css con @tailwind directives + variables Sci-Fi CSS

## Phase 8: Frontend — Domain + Infrastructure

- [X] T022 Crear frontend/src/domain/types.ts — AnalogLocation, SpaceTarget, AnalogSearchResult, CVInferenceResult, tipos response
- [X] T023 Crear frontend/src/infrastructure/api/analogClient.ts — fetchAllAnalogs, searchAnalogs, analyzeImage

## Phase 9: Frontend — Application Hooks [P]

- [X] T024 [P] Crear application/hooks/useAnalogList.ts — carga 1000 análogos (5 páginas paralelas)
- [X] T025 [P] Crear application/hooks/useAnalogSearch.ts — POST /analogs/search
- [X] T026 [P] Crear application/hooks/useCVAnalyze.ts — POST /cv/analyze

## Phase 10: Frontend — Components Sci-Fi [P]

- [X] T027 Crear MapView.tsx — Leaflet + 1000 CircleMarker canvas + ESRI Dark + OSM fallback (CHK031)
- [X] T028 Crear HudTooltip.tsx — HUD holográfico z-index:1005 (A-008, FR-021)
- [X] T029 Crear SearchPanel.tsx — formulario SpaceTarget + presets Mars/Moon/Volc
- [X] T030 Crear ResultsList.tsx — Top-5 con score bars cyan
- [X] T031 Crear ComparisonMatrix.tsx — barras cyan/amber + barras negativas (CHK030)
- [X] T032 Crear CVUploadPanel.tsx — drag & drop + estados idle/uploading/success/error
- [X] T033 Crear SciConsole.tsx — cURL dinámico con lat/lon + fecha YYYYMMDD (FR-024)

## Phase 11: Frontend — Integration + Validation

- [X] T034 Crear DashboardPage.tsx — composición 3-columnas (panel izq + mapa + panel der)
- [X] T035 Actualizar App.tsx → DashboardPage
- [X] T036 Verificar build (vite build) — 46 módulos, 1.20s
- [X] T037 Levantar Vite dev server en localhost:5173 y ejecutar Checks 7-11
- [X] T038 Recalibrar mock_data_generator.py para SC-002a/b/c deterministas (A-005)

## Phase 12: Convergence

- [X] T039 CRITICAL: Resolver contradicción pressure=0.001 vs pressure=0.0 del spec — ajustar SpaceTarget validator a `ge=0.0` (permite vacuum lunar), restaurar CVMockAdapter fixture a `pressure=0.0`, y recalibrar Altiplano a `pressure=0.0` manteniendo SC-002b determinista per Constitution §IV + spec.md §US2-AC1
- [X] T040 CRITICAL: Enmendar Constitution §Data con valores reales de calibración (A-005) — los valores de La Joya fueron cambiados (tempMax=35, tempMin=-33, pressure=1.5, uvIndex=0.5) para satisfacer SC-002a pero la Constitution tabla aún dice los originales (28.5, -8.5, 1013.0, 11.0); documentar decisión A-005 en constitution.md per Constitution §Governance
- [X] T041 CRITICAL: Corregir --color-bg a #050510 en frontend/src/index.css para alinear con Constitution §V ("Fondo: #050510"); actualizar DashboardPage inline background de '#020810' a '#050510'; y verificar que cyan (#06b6d4) y amber (#f59e0b) sean los valores canónicos per Constitution §V vs actuales #00f5ff/#fbbf24
- [X] T042 Crear README.md en raíz del monorepo con: descripción del proyecto, prerequisitos (Python 3.11, Node 18), comandos de instalación (`make install-backend`, `npm install`) y arranque (`make backend`, `make frontend`), y los 3 casos de prueba SC-002a/b/c per plan.md §Project Structure (missing)
- [X] T043 Alinear nombre del campo similarity score: renombrar `score` → `similarity_score` en backend/domain/entities.py AnalogSearchResult, actualizar euclidean_algorithm.py, analogs_router.py SearchResponse, y frontend/src/domain/types.ts AnalogSearchResult.score → similarity_score per spec.md §US1-AC1 + api-contracts.md (partial)
