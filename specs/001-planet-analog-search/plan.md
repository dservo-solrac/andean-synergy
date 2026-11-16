# Implementation Plan: Planet Analog Search Engine

**Branch**: `001-planet-analog-search` | **Date**: 2026-11-15 | **Spec**: specs/001-planet-analog-search/spec.md

**Input**: Feature specification from `specs/001-planet-analog-search/spec.md`

## Summary

Aplicación web monorepo (backend Python/FastAPI + frontend React/Vite) para NASA Space Apps Challenge 2026. Identifica análogos terrestres para misiones lunares y marcianas mediante distancia euclidiana ponderada (Min-Max) sobre 1000 registros en memoria (Zero-Database). Incluye mock del NASA-IBM Lunar Foundation Model (CV service) y dashboard Sci-Fi con Leaflet.js. Arquitectura: Modular Monolith con Clean Architecture de 4 capas + SOLID via Protocolos Python.

## Technical Context

**Language/Version**: Python 3.11 (backend), TypeScript/Node 18+ (frontend)

**Primary Dependencies**: FastAPI 0.110+, Pydantic 2.6+, Uvicorn (backend) | React 18, Vite 5+, Tailwind CSS 3+, react-leaflet 4+ (frontend)

**Storage**: N/A — Zero-Database. Todos los datos en RAM (1000 AnalogLocation, seed=42)

**Testing**: Verificación manual via curl + navegador (A-012: no automated tests para hackathon v1)

**Target Platform**: Desktop browser Chrome/Firefox + localhost (Python 3.11, Node 18)

**Project Type**: Web application monorepo (REST API backend + SPA frontend)

**Performance Goals**: Search < 1s (SC-001), Mapa < 3s carga (SC-004), CV response ~2s (SC-003)

**Constraints**: Sin internet para demo (SC-007), sin Docker (A-004), desktop >= 1280px (A-011)

**Scale/Scope**: 1000 registros inmutables, 4 endpoints API, 3 user stories, demo hackathon

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Estado | Evidencia |
|-----------|--------|-----------|
| I. Clean Architecture (4 capas) | ✅ PASS | FR-002/003: domain/, use_cases/, adapters/, infrastructure/ |
| II. SOLID — OCP (Strategy) | ✅ PASS | FR-005: ISimilarityAlgorithm inyectado en AnalogSearchService |
| II. SOLID — DIP (Protocolos) | ✅ PASS | FR-004: IAnalogRepository, ISimilarityAlgorithm, IVisionModelAdapter |
| II. SOLID — SRP | ✅ PASS | Cada router/service/adapter = responsabilidad única |
| II. SOLID — ISP | ✅ PASS | 3 Protocolos pequeños, no una interfaz monolítica |
| III. Zero-Database | ✅ PASS | FR-006: lifespan event, in-memory, sin disco ni DB externa |
| IV. Determinismo Tests | ✅ PASS | FR-016: fixture fijo. D-002: seed=42 en generator |
| V. UI Sci-Fi (z-index 1005) | ✅ PASS | FR-018..024: colores, z-index 1005, Leaflet ESRI |

**GATE PRE-PHASE 0: PASSED — Sin violaciones.**

**GATE POST-DESIGN: PASSED** — domain/protocols.py define 3 Protocolos. Ningún entity importa de infrastructure. seed=42 + fixture fijo garantizan SC-002a/b/c determinismo.

## Project Structure

### Documentation (this feature)

```text
specs/001-planet-analog-search/
├── plan.md              # Este archivo
├── research.md          # Decisiones tecnicas (Phase 0) - COMPLETADO
├── data-model.md        # Entidades y protocolos (Phase 1) - COMPLETADO
├── quickstart.md        # Guia de validacion (Phase 1) - COMPLETADO
├── contracts/
│   └── api-contracts.md # Contratos REST (Phase 1) - COMPLETADO
├── checklists/
│   └── requirements.md  # Checklist calidad requisitos - COMPLETADO
└── tasks.md             # Pendiente (speckit-tasks)
```

### Source Code (Monorepo)

```text
/ (raiz del monorepo)
├── Makefile
├── README.md
├── backend/
│   ├── main.py                        # FastAPI app + lifespan context manager
│   ├── requirements.txt
│   ├── domain/
│   │   ├── __init__.py
│   │   ├── entities.py                # AnalogLocation, SpaceTarget, AnalogSearchResult, CVInferenceResult
│   │   └── protocols.py               # IAnalogRepository, ISimilarityAlgorithm, IVisionModelAdapter
│   ├── use_cases/
│   │   ├── __init__.py
│   │   ├── analog_search_service.py   # AnalogSearchService (Strategy: ISimilarityAlgorithm)
│   │   └── cv_analysis_service.py     # CVAnalysisService (IVisionModelAdapter)
│   ├── adapters/
│   │   ├── __init__.py
│   │   └── routers/
│   │       ├── __init__.py
│   │       ├── analogs_router.py      # POST /search, GET / paginado
│   │       ├── cv_router.py           # POST /cv/analyze
│   │       └── health_router.py       # GET /health
│   └── infrastructure/
│       ├── __init__.py
│       ├── mock_data_generator.py     # generate_mock_data(seed=42) <- PRIMERA TAREA HITO 1
│       ├── in_memory_repository.py    # InMemoryAnalogRepository impl IAnalogRepository
│       ├── euclidean_algorithm.py     # EuclideanSimilarity impl ISimilarityAlgorithm
│       └── cv_mock_adapter.py         # CVMockAdapter impl IVisionModelAdapter
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── tsconfig.json
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── domain/
        │   └── types.ts               # Todos los tipos TS (AnalogLocation, SpaceTarget, etc.)
        ├── application/
        │   └── hooks/
        │       ├── useAnalogSearch.ts  # POST /api/v1/analogs/search
        │       ├── useCVAnalyze.ts     # POST /api/v1/cv/analyze
        │       └── useAnalogList.ts    # GET /api/v1/analogs (5 paginas paralelas)
        ├── infrastructure/
        │   └── api/
        │       └── analogClient.ts    # fetch wrapper HTTP hacia backend
        └── presentation/
            ├── components/
            │   ├── SearchPanel.tsx    # Formulario SpaceTarget
            │   ├── ResultsList.tsx    # Top-5 AnalogSearchResult
            │   ├── MapView.tsx        # Leaflet + 1000 marcadores (CircleMarker canvas)
            │   ├── HudTooltip.tsx     # HUD Holografico z-index:1005
            │   ├── ComparisonMatrix.tsx # Barras comparativas cyan/amber
            │   ├── CVUploadPanel.tsx  # Drag & drop + estados idle/uploading/success/error
            │   └── SciConsole.tsx     # Consola cientifica cURL dinamico
            └── pages/
                └── DashboardPage.tsx  # Composicion principal de la app

```

**Structure Decision**: Web application monorepo (Option 2 adaptado). Backend Python con Clean Architecture 4-capas. Frontend React/TypeScript con Clean Architecture 4-capas. Comunicacion via REST HTTP (localhost:8000 ↔ localhost:5173).

## Complexity Tracking

Sin violaciones de Constitution. No se requiere justificacion de complejidad adicional.

---

## Hitos de Implementacion

### HITO 1: Backend Python/FastAPI
**Objetivo**: API funcional que pasa Checks 1-6 del quickstart.md. Los 3 casos SC-002a/b/c verificables via curl.

**Orden de implementacion** (bloqueante secuencial salvo indicacion):
1. `infrastructure/mock_data_generator.py` — **PRIMERA TAREA, bloqueante para todo** (D-002)
2. `domain/entities.py` + `domain/protocols.py` — entidades puras + 3 Protocolos DIP
3. `infrastructure/in_memory_repository.py` — impl IAnalogRepository
4. `infrastructure/euclidean_algorithm.py` — impl ISimilarityAlgorithm (D-001)
5. `use_cases/analog_search_service.py` — recibe repo + algo via inyeccion
6. `adapters/routers/analogs_router.py` + `health_router.py` — endpoints GET + POST search
7. `main.py` — lifespan (D-003) + CORS (D-008) + mounting routers
8. `infrastructure/cv_mock_adapter.py` — impl IVisionModelAdapter (D-004)
9. `use_cases/cv_analysis_service.py` — recibe adapter via inyeccion
10. `adapters/routers/cv_router.py` — POST /cv/analyze multipart

### HITO 2: Frontend React/Leaflet
**Objetivo**: Dashboard interactivo que pasa Checks 7-11 del quickstart.md.
**Prerequisito**: HITO 1 completado y backend corriendo en localhost:8000.

**Orden de implementacion** (con paralelismo posible [P]):
1. Setup Vite + TypeScript + Tailwind + react-leaflet (bloqueante)
2. `domain/types.ts` + `infrastructure/api/analogClient.ts` (bloqueante)
3. [P] `hooks/useAnalogList.ts` + `MapView.tsx` + `HudTooltip.tsx` (US3 — D-006)
4. [P] `hooks/useAnalogSearch.ts` + `SearchPanel.tsx` + `ResultsList.tsx` (US1)
5. `ComparisonMatrix.tsx` (depende de ResultsList)
6. [P] `hooks/useCVAnalyze.ts` + `CVUploadPanel.tsx` (US2)
7. `SciConsole.tsx` (depende de selectedAnalog)
8. `DashboardPage.tsx` — composicion final de todos los componentes
