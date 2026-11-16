# Requirements Quality Checklist: Planet Analog Search Engine

**Purpose**: Validar la calidad, claridad y completitud de los requisitos escritos en spec.md.
**Created**: 2026-11-15
**Feature**: specs/001-planet-analog-search/spec.md
**Note**: `[x]` significa que el criterio de calidad de requisitos está satisfecho. No indica que la implementación esté completa.

---

## Completitud

- [x] CHK001 — ¿Están definidas todas las User Stories con prioridad (P1, P2, P3) asignada? [Completeness]
- [x] CHK002 — ¿Cada User Story tiene al menos 2 Acceptance Scenarios en formato Given/When/Then? [Completeness]
- [x] CHK003 — ¿Los 4 puntos geográficos obligatorios tienen valores numéricos exactos para todos sus campos (12 campos por registro)? [Completeness, FR-009]
- [x] CHK004 — ¿Están definidos todos los Protocolos Python de abstracción (IAnalogRepository, ISimilarityAlgorithm, IVisionModelAdapter)? [Completeness, FR-004]
- [x] CHK005 — ¿El vector de pesos del algoritmo euclidiano tiene valores numéricos explícitos para cada variable? [Completeness, FR-011]
- [x] CHK006 — ¿El JSON fixture del CV service está completamente especificado con todos sus campos y valores? [Completeness, FR-016]
- [x] CHK007 — ¿Los 4 endpoints de la API están documentados con sus métodos HTTP, rutas y tipos de datos? [Completeness, FR-025]
- [x] CHK008 — ¿Los Edge Cases cubren: sin resultados, backend no disponible, imagen corrupta, parámetros en cero, rendimiento del mapa? [Completeness]

## Claridad

- [x] CHK009 — ¿El término "Zero-Database" está definido sin ambigüedad en las Assumptions (A-002)? [Clarity]
- [x] CHK010 — ¿El término "federada" está clarificado como narrativo/aspiracional, no técnico (A-002)? [Clarity]
- [x] CHK011 — ¿El campo `loc` está diferenciado explícitamente de "location" para evitar confusión de nomenclatura (A-006)? [Clarity]
- [x] CHK012 — ¿El z-index del HUD tiene un único valor canónico (1005) sin ambigüedad entre documentos (A-008, FR-021)? [Clarity]
- [x] CHK013 — ¿La Consola Científica especifica si genera cURL estático o dinámico (A-009, FR-024)? [Clarity]
- [x] CHK014 — ¿La Matriz Comparativa especifica cuántos análogos compara simultáneamente (A-010, FR-022)? [Clarity]

## Medibilidad (Success Criteria)

- [x] CHK015 — ¿SC-001 (tiempo de respuesta) tiene un umbral numérico explícito (< 1 segundo)? [Measurability]
- [x] CHK016 — ¿SC-002a/b/c tienen el resultado esperado exacto (nombre del análogo) como criterio de aceptación? [Measurability]
- [x] CHK017 — ¿SC-003 (CV service timing) tiene tolerancia explícita (2.0 ± 0.5 segundos)? [Measurability]
- [x] CHK018 — ¿SC-004 (carga del mapa) tiene umbral numérico (< 3 segundos, 1000 marcadores)? [Measurability]
- [x] CHK019 — ¿SC-006 (Clean Architecture) es verificable con análisis estático de imports? [Measurability]

## Consistencia

- [x] CHK020 — ¿Los valores de los 4 puntos en FR-009 están calibrados para satisfacer SC-002a/b/c determinísticamente? [Consistency]
- [x] CHK021 — ¿El JSON fixture de FR-016 coincide con el que se autocompleta en US2-AC1 y produce SC-002b? [Consistency]
- [x] CHK022 — ¿La definición de "Microservicios" está reconciliada en A-001 con la arquitectura de monorepo propuesta? [Consistency]
- [x] CHK023 — ¿Los rangos de validación de FR-013 son consistentes con los valores de los 4 puntos en FR-009? [Consistency]

## Cobertura de Edge Cases

- [x] CHK024 — ¿Está especificado el comportamiento cuando todos los análogos tienen distancia > umbral? [Gap, Edge Cases]
- [x] CHK025 — ¿Está definido el comportamiento cuando el backend no está disponible desde el frontend? [Gap, Edge Cases]
- [x] CHK026 — ¿Están definidos los formatos de imagen aceptados y el tamaño máximo para el CV service (FR-014)? [Gap, Edge Cases]
- [x] CHK027 — ¿Están definidos los rangos de validación para todos los campos del SearchRequest (FR-013)? [Gap, Edge Cases]

## Independencia de Tecnología (Success Criteria)

- [x] CHK028 — ¿SC-001 está expresado en términos de experiencia de usuario (tiempo de respuesta) no de métricas de sistema (TPS, throughput)? [Tech-agnostic]
- [x] CHK029 — ¿SC-004 está expresado en términos observables por el usuario (tiempo de carga visual) no de métricas internas? [Tech-agnostic]

## Items Pendientes (Outstanding)

- [ ] CHK030 — ¿Están definidos los rangos de colores esperados para las barras de la Matriz Comparativa (ej. barras negativas para temperaturas bajo cero)? [Gap, FR-022] — *Pendiente: definir comportamiento visual para valores negativos en barras horizontales.*
- [ ] CHK031 — ¿Está especificado el comportamiento del mapa cuando el tile de ESRI Dark Canvas no está disponible (fallback a OpenStreetMap)? [Gap, SC-007, FR-019] — *Pendiente: definir la lógica de fallback de tiles explícitamente en FR-019.*
