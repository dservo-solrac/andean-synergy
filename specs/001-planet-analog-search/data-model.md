# Data Model: Planet Analog Search Engine

**Branch**: `001-planet-analog-search` | **Date**: 2026-11-15
**Layer**: Domain (backend/domain/) -- cero dependencias externas

---

## Entidades de Dominio (Backend)

### AnalogLocation -- Entidad Principal

Representa una ubicacion terrestre con sus parametros ambientales y fisicos.

Campos: id (UUID), name (str), lat (float, -90..90), lng (float, -180..180),
tempMax (float, C), tempMin (float, C, < tempMax), pressure (float, hPa, 0..1100),
solarRad (float, kWh/m2/d, 0..25), uvIndex (float, 0..25),
loc (float, Labile Organic Carbon g/kg, 0..500), friction (float, 0..1), cohesion (float, 0..1).
Derived: thermal_amplitude = tempMax - tempMin (calculado en use_case).

Reglas: tempMin < tempMax, lat in [-90,90], lng in [-180,180], pressure >= 0.

### Valores 4 Registros Obligatorios (FR-009)

| name | lat | lng | tempMax | tempMin | pressure | solarRad | uvIndex | loc | friction | cohesion |
|------|-----|-----|---------|---------|----------|----------|---------|-----|----------|----------|
| Mar de Cuarzo (Pampas de La Joya) | -16.48 | -71.98 | 28.5 | -8.5 | 1013.0 | 7.8 | 11.0 | 8.0 | 0.65 | 0.30 |
| Altiplano (Laguna Salinas) | -15.83 | -71.47 | 15.0 | -18.0 | 580.0 | 8.2 | 18.0 | 12.0 | 0.45 | 0.25 |
| Valle de los Volcanes de Andagua | -15.60 | -72.30 | 22.0 | 2.0 | 950.0 | 6.5 | 12.0 | 45.0 | 0.85 | 0.70 |
| Desierto de Atacama (Yungay) | -24.08 | -69.85 | 25.0 | -5.0 | 1008.0 | 7.5 | 13.0 | 15.0 | 0.60 | 0.35 |

### SpaceTarget -- Value Object (Input)

Campos: tempMax, tempMin, pressure, solarRad, uvIndex, loc (todos requeridos),
friction (default 0.5), cohesion (default 0.5).

Ejemplo Marte: {tempMax:-14, tempMin:-82, pressure:0.636, solarRad:5.9, uvIndex:0, loc:10, friction:0.6}
Ejemplo Luna: {tempMax:-20, tempMin:-230, pressure:0.0, solarRad:14.0, uvIndex:22, loc:5, friction:0.48}

### AnalogSearchResult -- Value Object (Output Motor)

Campos: rank (int, 1..5), similarity_score (float, 0..1), analog (AnalogLocation), thermal_amplitude (float).

### CVInferenceResult -- Value Object (Output CV)

Fixture fijo: {tempMax:-20.0, tempMin:-230.0, pressure:0.0, solarRad:14.0, uvIndex:22.0,
loc:5.0, friction:0.48, cohesion:0.30, model:"NASA-IBM Lunar Foundation Model v1.0-mock",
confidence:0.87, processing_time_ms:~2000}.

---

## Protocolos Python (backend/domain/protocols.py)

```python
from typing import Protocol, List, Optional
from uuid import UUID

class IAnalogRepository(Protocol):
    def get_all(self) -> List["AnalogLocation"]: ...
    def get_by_id(self, id: UUID) -> Optional["AnalogLocation"]: ...
    def get_paginated(self, page: int, size: int) -> List["AnalogLocation"]: ...
    def count(self) -> int: ...

class ISimilarityAlgorithm(Protocol):
    def calculate(
        self, target: "SpaceTarget",
        candidates: List["AnalogLocation"], top_n: int
    ) -> List["AnalogSearchResult"]: ...

class IVisionModelAdapter(Protocol):
    async def analyze(self, image_bytes: bytes, filename: str) -> "CVInferenceResult": ...
```

---

## Tipos TypeScript (frontend/src/domain/types.ts)

```typescript
export interface AnalogLocation {
  id: string; name: string; lat: number; lng: number;
  tempMax: number; tempMin: number; pressure: number;
  solarRad: number; uvIndex: number; loc: number;
  friction: number; cohesion: number;
  isKeyAnalog?: boolean;   // true para los 4 obligatorios
}
export interface SpaceTarget {
  tempMax: number; tempMin: number; pressure: number;
  solarRad: number; uvIndex: number; loc: number;
  friction: number; cohesion: number;
}
export interface AnalogSearchResult {
  rank: number; similarity_score: number;
  analog: AnalogLocation; thermal_amplitude: number;
}
export interface CVInferenceResult extends SpaceTarget {
  model: string; confidence: number; processing_time_ms: number;
}
export interface SearchResponse {
  results: AnalogSearchResult[]; target: SpaceTarget;
  computation_time_ms: number; warning?: string;
}
export interface AnalogListResponse {
  items: AnalogLocation[]; total: number; page: number; size: number;
}
```

---

## Flujo de Datos Principal

```
SpaceTarget (usuario) → POST /api/v1/analogs/search
  → AnalogSearchService.search(target, repo, algo)
      → repo.get_all() → 1000 AnalogLocation
      → algo.calculate(target, candidates, top_n=5)
          → normaliza con rangos de startup
          → distancia euclidiana ponderada
          → Top-5 AnalogSearchResult
  → SearchResponse (HTTP 200)

Imagen JPG/PNG → POST /api/v1/cv/analyze
  → CVMockAdapter.analyze(bytes, filename)
      → asyncio.sleep(2.0s)
      → CVInferenceResult (fixture fijo)
  → Frontend autocompleta SpaceTarget → ejecuta búsqueda
```

