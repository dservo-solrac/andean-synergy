# API Contracts: Planet Analog Search Engine

**Branch**: `001-planet-analog-search` | **Date**: 2026-11-15
**Base URL (dev)**: `http://localhost:8000/api/v1`
**Content-Type**: `application/json` (excepto CV que usa `multipart/form-data`)

---

## POST /api/v1/analogs/search

**Purpose**: Ejecutar el Motor de Similitud Euclidiana. Retorna Top-5 análogos terrestres.
**US**: US1 (P1) | **FR**: FR-010, FR-011, FR-012, FR-013

### Request Body (`SearchRequest`)
```json
{
  "tempMax": -14.0,
  "tempMin": -82.0,
  "pressure": 0.636,
  "solarRad": 5.9,
  "uvIndex": 0.0,
  "loc": 10.0,
  "friction": 0.6,
  "cohesion": 0.5
}
```

| Campo | Tipo | Requerido | Rango | Descripción |
|-------|------|-----------|-------|-------------|
| tempMax | float | ✅ | (-273, 500) | Temperatura máxima en °C |
| tempMin | float | ✅ | (-273, 500), < tempMax | Temperatura mínima en °C |
| pressure | float | ✅ | [0, 1100] | Presión en hPa (0 = vacío lunar) |
| solarRad | float | ✅ | [0, 25] | Radiación solar kWh/m²/día |
| uvIndex | float | ✅ | [0, 25] | Índice UV |
| loc | float | ✅ | [0, 500] | Labile Organic Carbon g/kg |
| friction | float | ❌ | [0, 1] | Coef. fricción (default: 0.5) |
| cohesion | float | ❌ | [0, 1] | Cohesión suelo (default: 0.5) |

### Response 200 (`SearchResponse`)
```json
{
  "results": [
    {
      "rank": 1,
      "similarity_score": 0.847,
      "thermal_amplitude": 37.0,
      "analog": {
        "id": "a1b2c3d4-0000-0000-0000-000000000001",
        "name": "Mar de Cuarzo (Pampas de La Joya)",
        "lat": -16.48,
        "lng": -71.98,
        "tempMax": 28.5,
        "tempMin": -8.5,
        "pressure": 1013.0,
        "solarRad": 7.8,
        "uvIndex": 11.0,
        "loc": 8.0,
        "friction": 0.65,
        "cohesion": 0.30,
        "isKeyAnalog": true
      }
    }
  ],
  "target": { "tempMax": -14.0, "tempMin": -82.0, "pressure": 0.636, "solarRad": 5.9, "uvIndex": 0.0, "loc": 10.0, "friction": 0.6, "cohesion": 0.5 },
  "computation_time_ms": 4,
  "warning": null
}
```

### Response 422 (Validation Error)
```json
{
  "detail": [
    { "loc": ["body", "tempMax"], "msg": "value is not a valid float", "type": "type_error.float" }
  ]
}
```

---

## POST /api/v1/cv/analyze

**Purpose**: CV Mock — procesa imagen, retorna parámetros físicos inferidos (fixture fijo).
**US**: US2 (P2) | **FR**: FR-014, FR-015, FR-016, FR-017

### Request
- **Content-Type**: `multipart/form-data`
- **Field**: `file` (JPG o PNG, máx. 10MB)

```bash
curl -X POST http://localhost:8000/api/v1/cv/analyze \
  -F "file=@surface_image.jpg"
```

### Response 200 (`CVInferenceResult`) — siempre igual
```json
{
  "tempMax": -20.0,
  "tempMin": -230.0,
  "pressure": 0.0,
  "solarRad": 14.0,
  "uvIndex": 22.0,
  "loc": 5.0,
  "friction": 0.48,
  "cohesion": 0.30,
  "model": "NASA-IBM Lunar Foundation Model v1.0-mock",
  "confidence": 0.87,
  "processing_time_ms": 2003
}
```

### Response 400 (Archivo inválido)
```json
{ "detail": "Formato no soportado. Por favor carga un archivo JPG o PNG de máximo 10MB." }
```

### Response 413 (Archivo muy grande)
```json
{ "detail": "El archivo excede el tamaño máximo de 10MB." }
```

---

## GET /api/v1/analogs

**Purpose**: Retorna todos los 1000 registros para renderizar marcadores en el mapa.
**US**: US3 (P3) | **FR**: FR-006, FR-025

### Query Parameters
| Param | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| page | int | 1 | Número de página (1-based) |
| size | int | 200 | Registros por página (máx. 200) |

### Response 200 (`AnalogListResponse`)
```json
{
  "items": [ { "id": "...", "name": "...", "lat": -16.48, "lng": -71.98, ... } ],
  "total": 1000,
  "page": 1,
  "size": 200
}
```

**Nota**: El frontend realiza 5 llamadas en paralelo (`page=1..5`) para cargar los 1000 registros al iniciar.

---

## GET /api/v1/health

**Purpose**: Health check del backend. Verifica que los 1000 registros están cargados en memoria.
**FR**: FR-025

### Response 200
```json
{ "status": "ok", "records_loaded": 1000, "version": "1.0.0-hackathon" }
```

---

## Esquema de Errores Comunes

| HTTP Code | Causa | Mensaje |
|-----------|-------|---------|
| 400 | Imagen corrupta o formato inválido | "El archivo de imagen está vacío o corrupto." |
| 413 | Archivo > 10MB | "El archivo excede el tamaño máximo de 10MB." |
| 422 | Validación Pydantic falló | Detail array con campos y mensajes |
| 500 | Error interno del servidor | "Internal server error" |

---

## Configuración CORS (FR-026)

```python
# backend/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```
