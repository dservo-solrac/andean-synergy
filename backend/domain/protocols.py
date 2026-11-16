"""
Domain Protocols — Planet Analog Search Engine
===============================================
Domain Layer: Protocolos de abstracción (DIP — Dependency Inversion Principle).
FR-004: 3 Protocolos. SOLID §OCP: use_cases dependen de abstracciones, no de
implementaciones concretas.

Ningún Protocol importa de infrastructure, adapters o use_cases.
"""
from __future__ import annotations

from typing import List, Protocol, runtime_checkable

from domain.entities import (
    AnalogLocation,
    AnalogSearchResult,
    CVInferenceResult,
    SpaceTarget,
)


@runtime_checkable
class IAnalogRepository(Protocol):
    """
    Protocolo de acceso al repositorio de análogos.
    Implementaciones: InMemoryAnalogRepository.
    FR-004, FR-006.
    """

    def get_all(self) -> List[AnalogLocation]:
        """Devuelve todos los análogos disponibles en memoria."""
        ...

    def get_paginated(self, page: int, page_size: int) -> List[AnalogLocation]:
        """
        Devuelve una página de análogos.
        page: 1-indexed. page_size: número de items por página.
        """
        ...

    def count(self) -> int:
        """Total de análogos en repositorio."""
        ...


@runtime_checkable
class ISimilarityAlgorithm(Protocol):
    """
    Protocolo del algoritmo de similitud.
    Implementaciones: EuclideanSimilarity.
    FR-004, FR-005, FR-011 (Strategy Pattern — OCP).
    """

    def rank(
        self,
        query: SpaceTarget,
        candidates: List[AnalogLocation],
        top_n: int = 5,
    ) -> List[AnalogSearchResult]:
        """
        Calcula similitud entre query y cada candidato.
        Returns: top_n resultados ordenados desc por score (rank 1 = mayor similitud).
        """
        ...


@runtime_checkable
class IVisionModelAdapter(Protocol):
    """
    Protocolo del adaptador al modelo de visión computacional NASA-IBM.
    Implementaciones: CVMockAdapter.
    FR-004, FR-016.
    """

    async def analyze(self, image_bytes: bytes, filename: str) -> CVInferenceResult:
        """
        Infiere parámetros ambientales a partir de una imagen.
        image_bytes: contenido binario de la imagen.
        filename: nombre original del archivo (para logging/debug).
        Returns: CVInferenceResult con parámetros inferidos + metadata del modelo.
        """
        ...
