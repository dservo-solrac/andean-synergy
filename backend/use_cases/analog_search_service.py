"""
Analog Search Service — Planet Analog Search Engine
====================================================
Use Cases Layer: orquesta la búsqueda de análogos.
FR-010, FR-011, FR-012.

SOLID OCP/DIP: recibe IAnalogRepository e ISimilarityAlgorithm via inyección.
No importa ninguna clase concreta de infrastructure.
Strategy Pattern: el algoritmo es intercambiable sin modificar este servicio.
"""
from __future__ import annotations

from typing import List

from domain.entities import AnalogSearchResult, SpaceTarget
from domain.protocols import IAnalogRepository, ISimilarityAlgorithm


class AnalogSearchService:
    """
    Caso de uso: buscar los N análogos más similares a un SpaceTarget.
    Utiliza IAnalogRepository para obtener candidatos e ISimilarityAlgorithm
    para calcular similitud. Ambas dependencias inyectadas en __init__.
    """

    def __init__(
        self,
        repository: IAnalogRepository,
        algorithm: ISimilarityAlgorithm,
    ) -> None:
        self._repository = repository
        self._algorithm = algorithm

    def search(
        self,
        query: SpaceTarget,
        top_n: int = 5,
    ) -> List[AnalogSearchResult]:
        """
        Busca los top_n análogos más similares al SpaceTarget dado.

        Args:
            query: parámetros del destino espacial
            top_n: número de resultados a retornar (default 5, FR-012)

        Returns:
            Lista de AnalogSearchResult ordenada por similitud desc (rank 1 = mejor)
        """
        candidates = self._repository.get_all()
        return self._algorithm.rank(query, candidates, top_n=top_n)
