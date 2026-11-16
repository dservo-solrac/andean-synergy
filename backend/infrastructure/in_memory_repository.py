"""
In-Memory Analog Repository — Planet Analog Search Engine
==========================================================
Infrastructure Layer: implementación de IAnalogRepository.
Zero-Database: datos exclusivamente en RAM (FR-006, D-002).

SOLID: implementa IAnalogRepository (DIP). No exporta hacia domain/use_cases.
"""
from __future__ import annotations

from typing import List

from domain.entities import AnalogLocation
from domain.protocols import IAnalogRepository
from infrastructure.mock_data_generator import generate_mock_data


class InMemoryAnalogRepository:
    """
    Repositorio en memoria. Se instancia una sola vez en el lifespan de FastAPI.
    Los datos son inmutables durante el ciclo de vida de la aplicación.
    Implementa IAnalogRepository (Protocol).
    """

    def __init__(self) -> None:
        raw = generate_mock_data()
        self._analogs: List[AnalogLocation] = [
            AnalogLocation(**record) for record in raw
        ]

    def get_all(self) -> List[AnalogLocation]:
        """Devuelve todos los análogos. O(1) — lista ya construida."""
        return self._analogs

    def get_paginated(self, page: int, page_size: int) -> List[AnalogLocation]:
        """
        Paginación 1-indexed.
        page=1, page_size=200 → items 0..199
        """
        if page < 1:
            page = 1
        start = (page - 1) * page_size
        end = start + page_size
        return self._analogs[start:end]

    def count(self) -> int:
        """Total de análogos en repositorio. Siempre 1000."""
        return len(self._analogs)


# Verificación de conformidad con Protocol en tiempo de importación
assert isinstance(InMemoryAnalogRepository(), IAnalogRepository), (
    "InMemoryAnalogRepository no cumple IAnalogRepository"
)
