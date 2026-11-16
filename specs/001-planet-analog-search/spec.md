# Feature Specification: Planet Analog Search Engine

**Feature Branch**: `001-planet-analog-search`
**Created**: 2026-11-15
**Status**: Draft
**Input**: User description: "Aplicación web NASA Space Apps Challenge 2026 — Planet Analog Search Engine"

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Motor de Búsqueda de Análogos por Parámetros (Priority: P1)

Un científico o juez del hackathon ingresa parámetros ambientales de un cuerpo celeste objetivo (Marte o Luna) y el sistema identifica el análogo terrestre más similar entre 1000 ubicaciones globales, priorizando la amplitud térmica como variable discriminante principal.

**Why this priority**: Es el núcleo científico del producto y el criterio de evaluación central del NASA Space Apps Challenge. Sin él, el resto carece de valor.

**Independent Test**: POST a `/api/v1/analogs/search` con parámetros marcianos → Top-1 debe ser "Mar de Cuarzo" con similarity_score ≥ 0.80 en < 1 segundo.

**Acceptance Scenarios**:

1. **Given** sistema con 1000 registros en memoria, **When** usuario envía (TempMax: -14, TempMin: -82, Pressure: 0.636, SolarRad: 5.9, UvIndex: 0, LOC: 10, Friction: 0.6), **Then** retorna Top-5 donde el primero es "Mar de Cuarzo (Pampas de La Joya)" con `similarity_score` ≥ 0.80.

2. **Given** motor activo, **When** usuario envía (Friction: 0.85, Cohesion: 0.70, TempMax: 22, TempMin: 2), **Then** Top-1 es "Valle de los Volcanes de Andagua" con `friction` ≥ 0.80.

3. **Given** sistema activo, **When** se envía `tempMax: 999` (fuera de rango), **Then** retorna HTTP 422 con mensaje de validación descriptivo.

4. **Given** sistema activo, **When** búsqueda válida ejecutada, **Then** tiempo de respuesta < 1 segundo.

---

### User Story 2 — Extracción de Parámetros vía IA Multimodal (Priority: P2)

Un investigador sube una imagen de la superficie lunar al panel CV. El sistema simula el "NASA-IBM Lunar Foundation Model", retorna parámetros físicos inferidos y autocompleta el formulario de búsqueda.

**Why this priority**: Diferenciador clave para los jueces. Demuestra integración de IA multimodal. Depende de US1.

**Independent Test**: Cargar cualquier JPG/PNG → respuesta en ~2s con JSON fixture determinista → Top-1 = "Altiplano (Laguna Salinas / Aguada Blanca)".

**Acceptance Scenarios**:

1. **Given** panel CV disponible, **When** usuario sube JPG/PNG ≤ 10MB, **Then** tras ~2s retorna JSON fixture: `{"tempMax": -20.0, "tempMin": -230.0, "pressure": 0.0, "solarRad": 14.0, "uvIndex": 22.0, "loc": 5.0, "friction": 0.48, "cohesion": 0.30, "model": "NASA-IBM Lunar Foundation Model v1.0-mock", "confidence": 0.87}` y autocompleta formulario.

2. **Given** formulario autocompletado con fixture lunar, **When** búsqueda ejecutada, **Then** Top-1 = "Altiplano (Laguna Salinas / Aguada Blanca)".

3. **Given** área drag & drop activa, **When** usuario sube archivo no-imagen (PDF, etc.), **Then** error: "Formato no soportado. Por favor carga un archivo JPG o PNG de máximo 10MB."

4. **Given** área drag & drop activa, **When** usuario sube JPG/PNG > 10MB, **Then** error: "El archivo excede el tamaño máximo de 10MB."

---

### User Story 3 — Dashboard Sci-Fi y Mapa Interactivo (Priority: P3)

Un juez o visitante explora el dashboard: 1000 puntos en mapa oscuro, hover para HUD holográfico, selección de análogo para Matriz Comparativa, Consola Científica con cURL dinámico.

**Why this priority**: Capa de presentación memorable y evaluable visualmente. Puede desarrollarse con datos mock en paralelo a US1/US2.

**Independent Test**: Con datos hardcodeados el mapa renderiza ≥ 1000 marcadores, hover muestra HUD z-index 1005, clic despliega Matriz Comparativa.

**Acceptance Scenarios**:

1. **Given** frontend con 1000 puntos cargados, **When** usuario hace hover sobre marcador, **Then** aparece HUD z-index=1005 con: Nombre, Lat/Lon (4 decimales), ΔT = TempMax−TempMin en °C, LOC en g/kg.

2. **Given** Top-5 retornado, **When** usuario selecciona análogo de la lista, **Then** Matriz Comparativa muestra barras horizontales comparando TempMax, TempMin, Presión y Radiación Solar (Target en cyan, Análogo en amber).

3. **Given** análogo seleccionado, **When** Consola Científica visible, **Then** muestra cURL dinámico con lat/lon del análogo hacia `https://power.larc.nasa.gov/api/temporal/daily/point`.

4. **Given** frontend cargado, **When** mapa renderiza inicialmente, **Then** los 4 puntos obligatorios tienen ícono amber/dorado; los 996 restantes ícono cyan.

---

### Edge Cases

- **Sin análogos similares**: Todos distance > 0.99 → retorna lista con `"warning": "No analog found with similarity > 0.5. Showing best available matches."`.
- **Backend no disponible**: Frontend muestra banner no bloqueante: "Backend no disponible. Verificar que el servidor está corriendo en localhost:8000."
- **Imagen corrupta o vacía**: CV service retorna HTTP 400: "El archivo de imagen está vacío o corrupto."
- **Parámetros todos en cero**: Retorna resultado con `"warning": "Target parameters are all zero. Results may not be scientifically meaningful."`.
- **1000 marcadores en mapa**: Carga inicial < 3 segundos usando Leaflet.markerCluster o CircleMarker.

---

## Requirements *(mandatory)*

### Functional Requirements

#### Arquitectura & Infraestructura

- **FR-001**: El sistema DEBE residir en un único repositorio (monorepo) con directorios `/backend` y `/frontend` en la raíz del proyecto.
- **FR-002**: El backend DEBE implementar Clean Architecture con 4 capas: `domain/` (entidades puras, sin dependencias externas), `use_cases/` (lógica de negocio), `adapters/` (controladores FastAPI), `infrastructure/` (mock data, conexiones externas).
- **FR-003**: El frontend DEBE implementar Clean Architecture con 4 capas: `domain/` (tipos/interfaces TS), `application/` (hooks y casos de uso), `presentation/` (componentes React), `infrastructure/` (servicios HTTP, Leaflet).
- **FR-004**: El backend DEBE definir tres Protocolos Python como abstracciones de dominio (Dependency Inversion): `IAnalogRepository`, `ISimilarityAlgorithm`, `IVisionModelAdapter`. Los Use Cases dependen SOLO de estas abstracciones.
- **FR-005**: El `AnalogSearchService` DEBE implementar el patrón Strategy para algoritmos de similitud: recibe `ISimilarityAlgorithm` como inyección de dependencia (Open/Closed Principle).

#### Datos — Arquitectura Zero-Database

- **FR-006**: El backend DEBE generar exactamente **1000 registros** de ubicaciones terrestres en memoria RAM al inicializarse (FastAPI startup event). Sin persistencia en disco ni base de datos externa.
- **FR-007**: Cada registro DEBE contener: `id` (UUID), `name` (str), `lat` (float, -90..90), `lng` (float, -180..180), `tempMax` (float, °C), `tempMin` (float, °C), `pressure` (float, hPa), `solarRad` (float, kWh/m²/día), `uvIndex` (float, 0..20), `loc` (float, Labile Organic Carbon g/kg), `friction` (float, 0..1), `cohesion` (float, 0..1).
- **FR-008**: Distribución geográfica: **40%** en región Perú/Bolivia/Norte de Chile (Lat: -22° a -8°, Lng: -76° a -66°), **60%** distribuidos globalmente en todos los continentes.
- **FR-009**: Los **4 registros obligatorios** DEBEN estar siempre presentes con exactamente estos valores:

| Campo | La Joya (Marte-like) | Altiplano (Luna-like) | Andagua (Basáltico) | Yungay (Hiper-árido) |
|-------|---------------------|----------------------|---------------------|---------------------|
| `name` | "Mar de Cuarzo (Pampas de La Joya)" | "Altiplano (Laguna Salinas / Aguada Blanca)" | "Valle de los Volcanes de Andagua" | "Desierto de Atacama (Yungay)" |
| `lat` | -16.4800 | -15.8300 | -15.6000 | -24.0800 |
| `lng` | -71.9800 | -71.4700 | -72.3000 | -69.8500 |
| `tempMax` | 28.5 | 15.0 | 22.0 | 25.0 |
| `tempMin` | -8.5 | -18.0 | 2.0 | -5.0 |
| `pressure` | 1013.0 | 580.0 | 950.0 | 1008.0 |
| `solarRad` | 7.8 | 8.2 | 6.5 | 7.5 |
| `uvIndex` | 11.0 | 18.0 | 12.0 | 13.0 |
| `loc` | 8.0 | 12.0 | 45.0 | 15.0 |
| `friction` | 0.65 | 0.45 | 0.85 | 0.60 |
| `cohesion` | 0.30 | 0.25 | 0.70 | 0.35 |


#### Motor de Similitud (AnalogSearchService)

- **FR-010**: El sistema DEBE calcular similitud usando **distancia euclidiana ponderada con normalización Min-Max** sobre 6 variables: `tempMax`, `tempMin`, `pressure`, `solarRad`, `uvIndex`, `loc`. La normalización usa los rangos globales del dataset en memoria, calculados en startup.
- **FR-011**: Vector de pesos del algoritmo: `thermal_amplitude` (TempMax−TempMin): **3.0**, `pressure`: **2.0**, `solarRad`: **1.5**, `uvIndex`: **1.5**, `loc`: **1.0**, `friction`: **1.0**. El campo `cohesion` es opcional y tiene peso **0.5** si se provee.
- **FR-012**: El endpoint de búsqueda DEBE retornar **Top-5 análogos** ordenados de mayor a menor similitud, con `similarity_score` (float, 0..1) = `1 - (distance / max_possible_distance)`.
- **FR-013**: Validación Pydantic de parámetros de entrada: `tempMax` y `tempMin` ∈ (-273, 500), `tempMin < tempMax`, `pressure` ∈ (0, 1100), `solarRad` ∈ (0, 25), `uvIndex` ∈ (0, 25), `loc` ∈ (0, 500), `friction` ∈ (0, 1), `cohesion` ∈ (0, 1).

#### Computer Vision Mock Service (ComputerVisionService)

- **FR-014**: El CV service DEBE aceptar archivos JPG y PNG con tamaño máximo de **10MB** vía `multipart/form-data`.
- **FR-015**: El CV service DEBE simular exactamente **2.0 segundos** de procesamiento (configurable vía `CV_MOCK_DELAY_SECONDS`, default: 2.0). Delay fijo, no variable.
- **FR-016**: El CV service DEBE retornar siempre el mismo **JSON determinista** (fixture fijo): `{"tempMax": -20.0, "tempMin": -230.0, "pressure": 0.0, "solarRad": 14.0, "uvIndex": 22.0, "loc": 5.0, "friction": 0.48, "cohesion": 0.30, "model": "NASA-IBM Lunar Foundation Model v1.0-mock", "confidence": 0.87}`.
- **FR-017**: El CV service DEBE implementarse como Mock Adapter del Protocolo `IVisionModelAdapter` en `backend/infrastructure/cv_mock_adapter.py`, reemplazable sin modificar Use Cases.

#### Interfaz de Usuario (Frontend)

- **FR-018**: Tema visual: fondo `#050510`, paleta Slate (gris oscuro), Cyan (`#06b6d4`) y Amber (`#f59e0b`). Sin otros colores primarios.
- **FR-019**: Mapa DEBE usar exclusivamente Leaflet.js con tile ESRI Dark Canvas: `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`.
- **FR-020**: Marcadores del mapa: 4 puntos obligatorios → ícono amber, tamaño 1.5x. 996 puntos generados → ícono cyan, tamaño 1x.
- **FR-021**: HUD Holográfico on-hover: `z-index: 1005` (canónico, per Constitution §5). Contenido: Nombre, Lat/Lon (4 decimales), ΔT (TempMax−TempMin en °C), LOC en g/kg.
- **FR-022**: Matriz Comparativa: barras horizontales para TempMax, TempMin, Presión y Radiación Solar. Target Espacial en cyan, Análogo Terrestre en amber. Muestra Top-1 seleccionado vs Target.
- **FR-023**: Upload CV: drag & drop nativo de React (sin librerías adicionales), JPG/PNG ≤ 10MB. Estados: idle, dragging-over, uploading, success, error.
- **FR-024**: Consola Científica: genera dinámicamente código cURL con lat/lon del análogo encontrado y fecha actual hacia `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,PRECTOTCORR&community=RE&longitude={lng}&latitude={lat}&start={YYYYMMDD}&end={YYYYMMDD}&format=JSON`.

#### API Contracts

- **FR-025**: Endpoints bajo prefijo `/api/v1`:
  - `POST /api/v1/analogs/search` → body: `SearchRequest`, response: `SearchResponse` (Top-5 `AnalogResult`).
  - `POST /api/v1/cv/analyze` → `multipart/form-data` con campo `file`, response: `CVInferenceResult`.
  - `GET /api/v1/analogs` → retorna todos los 1000 registros (paginado: `?page=1&size=200`).
  - `GET /api/v1/health` → `{"status": "ok", "records_loaded": 1000}`.
- **FR-026**: CORS configurado para `http://localhost:5173` en modo desarrollo.

### Key Entities

- **`AnalogLocation`** (Domain Entity): Ubicación terrestre con 12 campos paramétricos. Inmutable. Sin dependencias externas (pure Python dataclass).
- **`SpaceTarget`** (Domain Entity): Parámetros ambientales del cuerpo celeste objetivo. Idéntico a AnalogLocation sin `id`, `name`, `lat`, `lng`.
- **`AnalogSearchResult`** (Value Object): `AnalogLocation` + `similarity_score` (float) + `rank` (int).
- **`CVInferenceResult`** (Value Object): Campos de SpaceTarget + `model` (str) + `confidence` (float) + `processing_time_ms` (int).
- **`ISimilarityAlgorithm`** (Protocol): `calculate(target: SpaceTarget, candidates: List[AnalogLocation], top_n: int) -> List[AnalogSearchResult]`.
- **`IAnalogRepository`** (Protocol): `get_all() -> List[AnalogLocation]`, `get_by_id(id: UUID) -> Optional[AnalogLocation]`.
- **`IVisionModelAdapter`** (Protocol): `analyze(image_bytes: bytes, filename: str) -> CVInferenceResult`.


---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El motor de búsqueda retorna Top-5 análogos en **< 1 segundo** (desde recepción HTTP hasta envío de respuesta) para cualquier combinación válida de parámetros.
- **SC-002a**: Parámetros de Marte (TempMax: -14, TempMin: -82, Pressure: 0.636) → Top-1 = **"Mar de Cuarzo (Pampas de La Joya)"** con `similarity_score` ≥ 0.80. (Determinista al 100%).
- **SC-002b**: Upload de imagen JPG/PNG → autocompletado con fixture CV → Top-1 = **"Altiplano (Laguna Salinas / Aguada Blanca)"**. (Determinista al 100%).
- **SC-002c**: Parámetros de alta fricción (Friction: 0.85, TempMax: 22, TempMin: 2) → Top-1 = **"Valle de los Volcanes de Andagua"**. (Determinista al 100%).
- **SC-003**: CV service retorna respuesta en **2.0 ± 0.5 segundos** para cualquier imagen JPG/PNG válida ≤ 10MB.
- **SC-004**: Mapa Leaflet renderiza **1000 marcadores** en < **3 segundos** de carga inicial (Chrome/Firefox últimas versiones).
- **SC-005**: Los 4 puntos obligatorios están **visualmente distinguibles** en el mapa (ícono amber) y aparecen en Top-5 cuando los parámetros corresponden a su escenario de uso.
- **SC-006**: Clean Architecture verificable: ningún archivo en `domain/` importa de `infrastructure/` o `adapters/` (verificable con análisis estático de imports).
- **SC-007**: Sistema funciona **completamente sin conexión a internet** en modo demo (todos los datos son in-memory; tile de mapa puede degradarse a OpenStreetMap si ESRI no está disponible).

---

## Assumptions

- **A-001**: "Microservicios" en Constitution §2 se interpreta como **Modular Monolith con Clean Architecture** para el hackathon (un proceso backend FastAPI con módulos desacoplados vía Protocolos). No implica service mesh ni comunicación inter-servicio. Decisión documentada explícitamente para prevenir sobreingeniería.
- **A-002**: "Zero-Database federada" = todos los datos residen en memoria RAM durante el runtime. "Federada" es término narrativo que describe extensibilidad futura a múltiples fuentes, no una implementación técnica actual.
- **A-003**: El CV service retorna **siempre el mismo JSON fixture** independientemente de la imagen. Esto garantiza reproducibilidad de SC-002b. Sin varianza ni aleatoriedad en el output.
- **A-004**: Deploy target: **localhost** — backend `http://localhost:8000`, frontend `http://localhost:5173`. No se requiere configuración cloud para el hackathon.
- **A-005**: Los valores numéricos de los 4 puntos (FR-009) están pre-calibrados para garantizar que el algoritmo euclidiano los seleccione correctamente en sus escenarios de uso (SC-002a/b/c). Los pesos del vector (FR-011) fueron ajustados para esta calibración.
- **A-006**: El campo `loc` = "Labile Organic Carbon" (Carbono Orgánico Lábil) en g/kg. En código interno se referencia como `labile_organic_carbon` para evitar confusión con "location".
- **A-007**: La normalización Min-Max usa rangos del dataset completo calculados en startup. Los rangos no cambian en runtime (dataset estático).
- **A-008**: El z-index canónico del HUD es **1005** (Constitution §5). Cualquier referencia a "z-index > 1000" se resuelve con este valor.
- **A-009**: La Consola Científica genera cURL **dinámico** con parámetros reales del análogo encontrado. Es componente educativo/narrativo; no ejecuta la llamada HTTP real.
- **A-010**: La Matriz Comparativa compara exactamente **Top-1 seleccionado** vs Target Espacial (1-a-1). El usuario puede cambiar la selección haciendo clic en cualquier item del Top-5.
- **A-011**: Mobile support está **fuera del scope** de esta versión. Dashboard optimizado para escritorio ≥ 1280px.
- **A-012**: No se requieren pruebas automatizadas (unit/integration tests) para hackathon v1. Los SC-002a/b/c son verificación manual durante demo.

