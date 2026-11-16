"""
FastAPI Application — Planet Analog Search Engine
==================================================
Entry point del backend. Clean Architecture lifespan pattern.

Decision D-003: lifespan context manager (no @app.on_event deprecated).
Decision D-008: CORS abierto para desarrollo (localhost:5173).

Startup sequence:
  1. Instanciar InMemoryAnalogRepository (carga 1000 análogos, seed=42)
  2. Instanciar EuclideanSimilarity (pre-calcula Min-Max sobre 1000 registros)
  3. Instanciar AnalogSearchService(repo, algorithm)
  4. Instanciar CVMockAdapter → CVAnalysisService
  5. Montar routers: health, analogs, cv

SOLID DIP: main.py es el Composition Root — único lugar donde se instancian
implementaciones concretas y se inyectan via app.state.
"""
from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from adapters.routers.analogs_router import router as analogs_router
from adapters.routers.cv_router import router as cv_router
from adapters.routers.health_router import router as health_router

# Implementaciones concretas (solo importadas en Composition Root)
from infrastructure.cv_mock_adapter import CVMockAdapter
from infrastructure.euclidean_algorithm import EuclideanSimilarity
from infrastructure.in_memory_repository import InMemoryAnalogRepository
from use_cases.analog_search_service import AnalogSearchService
from use_cases.cv_analysis_service import CVAnalysisService


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """
    Lifespan context manager (FR-006, D-003).
    Inicializa todos los servicios al startup y los libera al shutdown.
    Zero-Database: todos los datos viven en app.state durante el ciclo de vida.
    """
    # ── STARTUP ──────────────────────────────────────────────────────────────
    print("[STARTUP] Inicializando Planet Analog Search Engine...")

    # 1. Repositorio + datos en memoria (seed=42)
    repository = InMemoryAnalogRepository()
    print(f"[STARTUP] Repositorio listo: {repository.count()} análogos cargados")

    # 2. Algoritmo euclidiano con Min-Max pre-calculado
    algorithm = EuclideanSimilarity(corpus=repository.get_all())
    print("[STARTUP] Algoritmo euclidiano inicializado (Min-Max pre-calculado)")

    # 3. Servicio de búsqueda (Strategy Pattern: repo + algorithm inyectados)
    search_service = AnalogSearchService(repository=repository, algorithm=algorithm)
    print("[STARTUP] AnalogSearchService listo")

    # 4. CV Mock Adapter + CV Service
    cv_adapter = CVMockAdapter()
    cv_service = CVAnalysisService(adapter=cv_adapter)
    print("[STARTUP] CVAnalysisService listo (NASA-IBM mock, latencia ~2s)")

    # Inyección de servicios en app.state (accessible via request.app.state)
    app.state.repository = repository
    app.state.search_service = search_service
    app.state.cv_service = cv_service

    print("[STARTUP] ✅ Todos los servicios listos. API disponible en http://localhost:8000")
    print("[STARTUP] ✅ Docs: http://localhost:8000/docs")

    yield  # ─── RUNTIME ───────────────────────────────────────────────────────

    # ── SHUTDOWN ─────────────────────────────────────────────────────────────
    print("[SHUTDOWN] Planet Analog Search Engine detenido.")


# ─── Aplicación FastAPI ────────────────────────────────────────────────────────

app = FastAPI(
    title="Planet Analog Search Engine",
    description=(
        "API para identificar análogos terrestres de destinos espaciales "
        "(Luna / Marte) mediante distancia euclidiana ponderada. "
        "NASA Space Apps Challenge 2026."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ─── CORS (D-008) ─────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://localhost:3000",   # alternativa React
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers (prefix /api/v1) ─────────────────────────────────────────────────
API_PREFIX = "/api/v1"

app.include_router(health_router, prefix=API_PREFIX)
app.include_router(analogs_router, prefix=API_PREFIX)
app.include_router(cv_router, prefix=API_PREFIX)


# ─── Root redirect ────────────────────────────────────────────────────────────
@app.get("/", include_in_schema=False)
def root():
    return {
        "service": "Planet Analog Search Engine",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/v1/health",
        "search": "POST /api/v1/analogs/search",
        "analogs": "GET /api/v1/analogs",
        "cv": "POST /api/v1/cv/analyze",
    }
