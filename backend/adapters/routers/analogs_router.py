"""
Analogs Router — Planet Analog Search Engine
============================================
Adapters Layer: endpoints REST para análogos.
FR-025: GET /api/v1/analogs (paginado), POST /api/v1/analogs/search.
Contrato completo en contracts/api-contracts.md.
"""
from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel

from domain.entities import AnalogLocation, AnalogSearchResult, SpaceTarget

router = APIRouter(prefix="/analogs", tags=["analogs"])


# ─── Request / Response Schemas ────────────────────────────────────────────────

class SearchRequest(BaseModel):
    """Body del POST /search. Contiene SpaceTarget + top_n opcional."""
    target: SpaceTarget
    top_n: int = 5

    model_config = {"json_schema_extra": {
        "example": {
            "target": {
                "tempMax": -20.0,
                "tempMin": -230.0,
                "pressure": 0.001,
                "solarRad": 14.0,
                "uvIndex": 22.0,
                "loc": 5.0,
                "friction": 0.48,
                "cohesion": 0.30,
            },
            "top_n": 5,
        }
    }}


class AnalogPage(BaseModel):
    """Respuesta paginada del GET /analogs."""
    items: List[AnalogLocation]
    total: int
    page: int
    page_size: int
    total_pages: int


class SearchResponse(BaseModel):
    """Respuesta del POST /search."""
    results: List[AnalogSearchResult]
    query: SpaceTarget
    total_candidates: int


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _get_search_service(request: Request):
    """Obtiene AnalogSearchService del app.state inyectado en lifespan."""
    service = getattr(request.app.state, "search_service", None)
    if service is None:
        raise HTTPException(503, "Search service not initialized")
    return service


def _get_repository(request: Request):
    """Obtiene IAnalogRepository del app.state."""
    repo = getattr(request.app.state, "repository", None)
    if repo is None:
        raise HTTPException(503, "Repository not initialized")
    return repo


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.get(
    "/",
    response_model=AnalogPage,
    summary="Listar análogos paginados",
    description="Devuelve todos los análogos disponibles con paginación. "
                "5 páginas × 200 items = 1000 registros totales (FR-008).",
)
def list_analogs(
    page: int = Query(default=1, ge=1, description="Número de página (1-indexed)"),
    page_size: int = Query(default=200, ge=1, le=500, description="Items por página"),
    repository=Depends(_get_repository),
) -> AnalogPage:
    total = repository.count()
    items = repository.get_paginated(page=page, page_size=page_size)
    total_pages = max(1, -(-total // page_size))  # ceil division

    return AnalogPage(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.post(
    "/search",
    response_model=SearchResponse,
    summary="Buscar análogos similares",
    description="Recibe parámetros de un destino espacial y devuelve los "
                "top-N análogos más similares por distancia euclidiana "
                "ponderada (FR-011, SC-001 < 1s).",
)
def search_analogs(
    body: SearchRequest,
    search_service=Depends(_get_search_service),
    repository=Depends(_get_repository),
) -> SearchResponse:
    if body.top_n < 1 or body.top_n > 20:
        raise HTTPException(422, "top_n debe estar en [1, 20]")

    results = search_service.search(query=body.target, top_n=body.top_n)

    return SearchResponse(
        results=results,
        query=body.target,
        total_candidates=repository.count(),
    )
