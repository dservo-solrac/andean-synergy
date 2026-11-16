"""
CV Router — Planet Analog Search Engine
=======================================
Adapters Layer: endpoint POST /cv/analyze multipart.
FR-014, FR-015, FR-016, FR-025.
Contrato completo en contracts/api-contracts.md §Endpoint 4.

Acepta imagen (JPEG/PNG/WEBP, max 10MB), retorna CVInferenceResult.
Respuesta típica: 2.0 ± 0.5 s (SC-003 — mock latency).
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile
from fastapi import File as FastAPIFile
from pydantic import BaseModel

from domain.entities import CVInferenceResult

router = APIRouter(prefix="/cv", tags=["cv"])

# Formatos aceptados (FR-014)
_ACCEPTED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
}
_MAX_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB (FR-014)


class CVAnalyzeResponse(BaseModel):
    """Respuesta del endpoint POST /cv/analyze."""
    inference: CVInferenceResult
    filename: str
    size_bytes: int


def _get_cv_service(request: Request):
    """Obtiene CVAnalysisService del app.state inyectado en lifespan."""
    service = getattr(request.app.state, "cv_service", None)
    if service is None:
        raise HTTPException(503, "CV service not initialized")
    return service


@router.post(
    "/analyze",
    response_model=CVAnalyzeResponse,
    summary="Analizar imagen con NASA-IBM Lunar Foundation Model",
    description="Recibe una imagen (JPEG/PNG/WEBP, máx 10 MB) y devuelve "
                "parámetros ambientales inferidos por el modelo de visión. "
                "Tiempo típico de respuesta: 2.0 ± 0.5 s (SC-003).",
)
async def analyze_image(
    file: UploadFile = FastAPIFile(..., description="Imagen a analizar (JPEG/PNG/WEBP, max 10MB)"),
    cv_service=Depends(_get_cv_service),
) -> CVAnalyzeResponse:
    # Validación de tipo MIME (FR-014)
    content_type = file.content_type or ""
    if content_type not in _ACCEPTED_CONTENT_TYPES:
        raise HTTPException(
            415,
            f"Formato no soportado: '{content_type}'. "
            f"Aceptados: {sorted(_ACCEPTED_CONTENT_TYPES)}",
        )

    # Leer bytes y validar tamaño (FR-014)
    image_bytes = await file.read()
    if len(image_bytes) > _MAX_SIZE_BYTES:
        raise HTTPException(
            413,
            f"Imagen demasiado grande: {len(image_bytes)} bytes. Máximo: {_MAX_SIZE_BYTES} bytes (10 MB)",
        )
    if len(image_bytes) == 0:
        raise HTTPException(400, "El archivo está vacío")

    # Delegar análisis al servicio (async — simula latencia del modelo)
    result: CVInferenceResult = await cv_service.analyze_image(
        image_bytes=image_bytes,
        filename=file.filename or "unknown",
    )

    return CVAnalyzeResponse(
        inference=result,
        filename=file.filename or "unknown",
        size_bytes=len(image_bytes),
    )
