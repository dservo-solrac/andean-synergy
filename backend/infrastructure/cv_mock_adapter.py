"""
CV Mock Adapter — Planet Analog Search Engine
=============================================
Infrastructure Layer: mock del NASA-IBM Lunar Foundation Model v1.0.
FR-016, D-004.

SOLID DIP: implementa IVisionModelAdapter.
El fixture es completamente determinístico (siempre retorna los mismos valores).
El delay de asyncio.sleep(2.0) simula latencia realista del modelo real (SC-003: 2.0±0.5s).
"""
from __future__ import annotations

import asyncio

from domain.entities import CVInferenceResult
from domain.protocols import IVisionModelAdapter

# Fixture fijo definido en FR-016 y spec.md §US2-AC1
_CV_FIXTURE = CVInferenceResult(
    tempMax=-20.0,
    tempMin=-230.0,
    pressure=0.0,       # Vacío lunar — spec.md §US2-AC1 y Constitution §CV Mock Fixture
    solarRad=14.0,
    uvIndex=22.0,
    loc=5.0,
    friction=0.48,
    cohesion=0.30,
    model="NASA-IBM Lunar Foundation Model v1.0-mock",
    confidence=0.87,
)

# Latencia simulada del modelo (SC-003: 2.0 ± 0.5 s)
_MOCK_LATENCY_SECONDS = 2.0


class CVMockAdapter:
    """
    Adaptador mock del modelo NASA-IBM de visión computacional.
    Siempre retorna el fixture de FR-016 tras un delay de _MOCK_LATENCY_SECONDS.
    Implementa IVisionModelAdapter (Protocol).

    En producción real, esta clase sería reemplazada por una que llame al
    endpoint real del NASA-IBM Foundation Model sin modificar CVAnalysisService
    (OCP — Open/Closed Principle).
    """

    async def analyze(self, image_bytes: bytes, filename: str) -> CVInferenceResult:
        """
        Simula inferencia del NASA-IBM Lunar Foundation Model.

        Args:
            image_bytes: contenido binario de la imagen (recibido pero no procesado en mock)
            filename: nombre original del archivo (para logging en producción)

        Returns:
            CVInferenceResult con el fixture determinístico de FR-016.
        """
        # Validación mínima: la imagen no puede estar vacía
        if not image_bytes:
            raise ValueError("La imagen está vacía o no fue recibida correctamente")

        # Simulación de latencia de inferencia del modelo
        await asyncio.sleep(_MOCK_LATENCY_SECONDS)

        return _CV_FIXTURE


# Verificación de conformidad con Protocol
assert isinstance(CVMockAdapter(), IVisionModelAdapter), (
    "CVMockAdapter no cumple IVisionModelAdapter"
)
