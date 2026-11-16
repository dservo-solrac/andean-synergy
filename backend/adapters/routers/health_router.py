"""
Health Router — Planet Analog Search Engine
===========================================
Adapters Layer: endpoint GET /health.
FR-025: health check para verificar estado del servicio.
Check #1 del quickstart.md.
"""
from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Request
from pydantic import BaseModel

router = APIRouter(tags=["health"])


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    analog_count: int
    timestamp: str


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check",
    description="Verifica que el servicio está disponible y el repositorio inicializado.",
)
def health_check(request: Request) -> HealthResponse:
    repo = getattr(request.app.state, "repository", None)
    count = repo.count() if repo else 0

    return HealthResponse(
        status="ok",
        service="Planet Analog Search Engine",
        version="1.0.0",
        analog_count=count,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
