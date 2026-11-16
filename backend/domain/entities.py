"""
Domain Entities — Planet Analog Search Engine
==============================================
Domain Layer: entidades puras. Cero imports de infrastructure o adapters.
Sin efectos secundarios. Solo modelos de datos y lógica de dominio pura.

SOLID SRP: cada clase tiene una única responsabilidad.
"""
from __future__ import annotations

import uuid
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class AnalogLocation(BaseModel):
    """
    Ubicación terrestre análoga con datos ambientales/geotécnicos.
    FR-001, FR-008, FR-009.
    """
    id: uuid.UUID = Field(default_factory=uuid.uuid4, description="UUID único")
    name: str = Field(..., description="Nombre del sitio")
    lat: float = Field(..., ge=-90.0, le=90.0, description="Latitud WGS-84")
    lng: float = Field(..., ge=-180.0, le=180.0, description="Longitud WGS-84")

    # Variables ambientales
    tempMax: float = Field(..., description="Temperatura máxima diaria (°C)")
    tempMin: float = Field(..., description="Temperatura mínima diaria (°C)")
    pressure: float = Field(..., ge=0.0, description="Presión atmosférica (hPa) — 0.0 = vacío lunar")
    solarRad: float = Field(..., ge=0.0, description="Radiación solar (kWh/m²/día)")
    uvIndex: float = Field(..., ge=0.0, description="Índice UV promedio diario")

    # Variables geotécnicas
    loc: float = Field(..., ge=0.0, description="Loss on Combustion % (MO del suelo, normalizado)")
    friction: float = Field(..., ge=0.0, le=1.0, description="Ángulo de fricción interna normalizado [0,1]")
    cohesion: float = Field(..., ge=0.0, le=1.0, description="Cohesión normalizada [0,1]")

    # Metadatos
    isKeyAnalog: bool = Field(default=False, description="True = uno de los 4 puntos de calibración")

    model_config = {"frozen": True}


class SpaceTarget(BaseModel):
    """
    Parámetros del destino espacial (Luna / Marte) ingresados por el usuario.
    FR-010, FR-013.
    """
    tempMax: float = Field(..., ge=-300.0, le=500.0, description="Temperatura máxima (°C)")
    tempMin: float = Field(..., ge=-300.0, le=500.0, description="Temperatura mínima (°C)")
    pressure: float = Field(..., ge=0.0, le=10_000.0, description="Presión (hPa) — 0.0 es vacío lunar válido")
    solarRad: float = Field(..., ge=0.0, le=20.0, description="Radiación solar (kWh/m²/día)")
    uvIndex: float = Field(..., ge=0.0, le=100.0, description="Índice UV")
    loc: float = Field(..., ge=0.0, le=1000.0, description="LOC (Loss on Combustion %)")
    friction: float = Field(..., ge=0.0, le=1.0, description="Fricción interna normalizada")
    cohesion: float = Field(..., ge=0.0, le=1.0, description="Cohesión normalizada")

    @field_validator("tempMin")
    @classmethod
    def temp_min_less_than_max(cls, v: float, info) -> float:
        if "tempMax" in info.data and v >= info.data["tempMax"]:
            raise ValueError("tempMin debe ser menor que tempMax")
        return v

    model_config = {"frozen": True}


class AnalogSearchResult(BaseModel):
    """
    Resultado de búsqueda: un análogo con su score de similitud.
    FR-012: top-5. Score = 1 / (1 + dist_euclidiana_ponderada). Range [0, 1].
    """
    analog: AnalogLocation
    similarity_score: float = Field(..., ge=0.0, le=1.0, description="Similitud [0=mínima, 1=máxima]")
    rank: int = Field(..., ge=1, description="Posición en el ranking (1=mejor)")

    model_config = {"frozen": True}


class CVInferenceResult(BaseModel):
    """
    Resultado del modelo NASA-IBM Lunar Foundation Model (mock).
    FR-016: fixture fijo determinístico.
    """
    tempMax: float = Field(..., description="Temperatura máxima inferida (°C)")
    tempMin: float = Field(..., description="Temperatura mínima inferida (°C)")
    pressure: float = Field(..., description="Presión inferida (hPa)")
    solarRad: float = Field(..., description="Radiación solar inferida (kWh/m²/día)")
    uvIndex: float = Field(..., description="Índice UV inferido")
    loc: float = Field(..., description="LOC inferido")
    friction: float = Field(..., description="Fricción interna inferida")
    cohesion: float = Field(..., description="Cohesión inferida")
    model: str = Field(..., description="Nombre del modelo de inferencia")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confianza del modelo")

    model_config = {"frozen": True}
