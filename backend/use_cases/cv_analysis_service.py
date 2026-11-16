"""
CV Analysis Service — Planet Analog Search Engine
==================================================
Use Cases Layer: orquesta el análisis de imagen por CV.
FR-015, FR-016.

SOLID DIP: recibe IVisionModelAdapter via inyección.
No importa ninguna clase concreta de infrastructure.
"""
from __future__ import annotations

from domain.entities import CVInferenceResult
from domain.protocols import IVisionModelAdapter


class CVAnalysisService:
    """
    Caso de uso: analizar una imagen y retornar parámetros ambientales inferidos.
    Delega completamente la inferencia al IVisionModelAdapter inyectado.
    """

    def __init__(self, adapter: IVisionModelAdapter) -> None:
        self._adapter = adapter

    async def analyze_image(
        self,
        image_bytes: bytes,
        filename: str,
    ) -> CVInferenceResult:
        """
        Analiza una imagen y retorna parámetros ambientales inferidos.

        Args:
            image_bytes: contenido binario de la imagen
            filename: nombre original del archivo

        Returns:
            CVInferenceResult con los parámetros inferidos y metadata del modelo
        """
        return await self._adapter.analyze(image_bytes=image_bytes, filename=filename)
