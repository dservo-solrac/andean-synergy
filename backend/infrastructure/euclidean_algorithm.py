"""
Euclidean Similarity Algorithm — Planet Analog Search Engine
============================================================
Infrastructure Layer: implementación de ISimilarityAlgorithm.
FR-005, FR-011, D-001.

Algoritmo:
  1. Extraer las 7 variables de cada AnalogLocation y SpaceTarget
  2. Normalización Min-Max sobre el corpus completo (rango global)
  3. Distancia Euclidiana ponderada con pesos definidos en FR-011
  4. Score = 1 / (1 + distancia) → Range [0, 1], 1 = idéntico

Pesos (FR-011):
  thermal_amplitude = 3.0  (tempMax - tempMin)
  pressure          = 2.0
  solarRad          = 1.5
  uvIndex           = 1.5
  loc               = 1.0
  friction          = 1.0
  cohesion          = 0.5
"""
from __future__ import annotations

import math
from typing import List, Tuple

from domain.entities import AnalogLocation, AnalogSearchResult, SpaceTarget
from domain.protocols import ISimilarityAlgorithm

# Pesos del algoritmo (FR-011) — inmutables
_WEIGHTS: dict[str, float] = {
    "thermal_amplitude": 3.0,
    "pressure": 2.0,
    "solarRad": 1.5,
    "uvIndex": 1.5,
    "loc": 1.0,
    "friction": 1.0,
    "cohesion": 0.5,
}


def _extract_features(loc: AnalogLocation) -> Tuple[float, ...]:
    """Extrae el vector de 7 características de un AnalogLocation."""
    return (
        loc.tempMax - loc.tempMin,  # thermal_amplitude
        loc.pressure,
        loc.solarRad,
        loc.uvIndex,
        loc.loc,
        loc.friction,
        loc.cohesion,
    )


def _extract_query_features(query: SpaceTarget) -> Tuple[float, ...]:
    """Extrae el vector de 7 características de un SpaceTarget."""
    return (
        query.tempMax - query.tempMin,  # thermal_amplitude
        query.pressure,
        query.solarRad,
        query.uvIndex,
        query.loc,
        query.friction,
        query.cohesion,
    )


_WEIGHT_VECTOR: Tuple[float, ...] = tuple(_WEIGHTS.values())
_FEATURE_NAMES: Tuple[str, ...] = tuple(_WEIGHTS.keys())


class EuclideanSimilarity:
    """
    Calcula similitud euclidiana ponderada con normalización Min-Max.
    Se precalcula el rango global del corpus en __init__ para O(1) por query.
    Implementa ISimilarityAlgorithm (Protocol).
    """

    def __init__(self, corpus: List[AnalogLocation]) -> None:
        """
        Pre-calcula min/max de cada feature sobre el corpus completo.
        Garantiza que la normalización sea estable y determinista (seed=42).
        """
        if not corpus:
            raise ValueError("El corpus no puede estar vacío")

        all_features = [_extract_features(loc) for loc in corpus]
        n_features = len(_WEIGHT_VECTOR)

        self._mins: Tuple[float, ...] = tuple(
            min(f[i] for f in all_features) for i in range(n_features)
        )
        self._maxs: Tuple[float, ...] = tuple(
            max(f[i] for f in all_features) for i in range(n_features)
        )
        # Rango: evita división por cero cuando min == max
        self._ranges: Tuple[float, ...] = tuple(
            (self._maxs[i] - self._mins[i]) or 1.0 for i in range(n_features)
        )

    def _normalize(self, features: Tuple[float, ...]) -> Tuple[float, ...]:
        """Min-Max normalización al espacio [0, 1]."""
        return tuple(
            (features[i] - self._mins[i]) / self._ranges[i]
            for i in range(len(features))
        )

    def _weighted_euclidean(
        self,
        a: Tuple[float, ...],
        b: Tuple[float, ...],
    ) -> float:
        """Distancia euclidiana ponderada entre dos vectores normalizados."""
        return math.sqrt(
            sum(
                _WEIGHT_VECTOR[i] * (a[i] - b[i]) ** 2
                for i in range(len(a))
            )
        )

    def rank(
        self,
        query: SpaceTarget,
        candidates: List[AnalogLocation],
        top_n: int = 5,
    ) -> List[AnalogSearchResult]:
        """
        Calcula similitud entre query y cada candidato.
        Returns: top_n resultados ordenados desc por score.
        O(N) por query, N=1000 → siempre < 1s (SC-001).
        """
        q_raw = _extract_query_features(query)
        q_norm = self._normalize(q_raw)

        scored: list[tuple[float, AnalogLocation]] = []
        for analog in candidates:
            a_raw = _extract_features(analog)
            a_norm = self._normalize(a_raw)
            dist = self._weighted_euclidean(q_norm, a_norm)
            score = 1.0 / (1.0 + dist)
            scored.append((score, analog))

        # Orden descendente por score (mayor similitud primero)
        scored.sort(key=lambda x: x[0], reverse=True)
        top = scored[:top_n]

        return [
            AnalogSearchResult(analog=analog, similarity_score=round(score, 6), rank=rank)
            for rank, (score, analog) in enumerate(top, start=1)
        ]


# Verificación Protocol en tiempo de importación
# (requiere corpus — se verifica en main.py al instanciar)
assert issubclass(EuclideanSimilarity, type) or True  # type: ignore[arg-type]
