# Planet Analog Search Engine — Constitution

## Core Principles

### I. Clean Architecture (NON-NEGOTIABLE)
Separacion estricta de capas en Backend y Frontend. MUST:
- **Backend**: domain/ (entidades puras, cero imports externos), use_cases/ (logica de negocio), adapters/ (controladores FastAPI), infrastructure/ (mock data, conexiones externas).
- **Frontend**: domain/ (tipos TS), application/ (hooks/use-cases), presentation/ (componentes React), infrastructure/ (servicios HTTP, Leaflet).
- Ningun archivo de domain/ DEBE importar de infrastructure/ o adapters/. Verificable con analisis estatico.

### II. SOLID Principles (NON-NEGOTIABLE)
- **S**: Cada servicio, controlador o componente React tiene una unica razon para cambiar.
- **O**: El motor de busqueda (AnalogSearchService) DEBE aceptar ISimilarityAlgorithm via inyeccion. Extendible sin modificar el core.
- **I**: Protocolos Python pequenos: IAnalogRepository, ISimilarityAlgorithm, IVisionModelAdapter.
- **D**: Use Cases dependen SOLO de abstracciones (Protocolos), nunca de implementaciones concretas.

### III. Zero-Database Architecture
Todos los datos residen exclusivamente en memoria RAM durante el runtime. Sin persistencia en disco ni base de datos externa. Los 1000 registros se generan en el FastAPI startup event. Federada es termino narrativo (extensibilidad futura), no implementacion tecnica actual.

### IV. Determinismo en Tests de Integracion
Los 3 casos de prueba de negocio (SC-002a/b/c) DEBEN ser 100% deterministas. Los valores de los 4 puntos geograficos obligatorios y el JSON fixture del CV service estan pre-calibrados para garantizarlo. Nunca introducir aleatoriedad en los outputs de los servicios mock.

### V. UI Sci-Fi Dashboard
- Fondo: #050510. Paleta: Slate, Cyan (#06b6d4), Amber (#f59e0b).
- Mapa: Leaflet.js exclusivamente con tile ESRI Dark Canvas. Fallback permitido: OpenStreetMap.
- HUD Holografico on-hover: z-index: 1005 (valor canonico, no negociable).
- 4 puntos obligatorios: icono amber. 996 generados: icono cyan.

## Tech Stack

| Capa | Tecnologia | Version |
|------|-----------|--------|
| Backend runtime | Python | 3.11 |
| Backend framework | FastAPI + Pydantic + Uvicorn | latest stable |
| Frontend runtime | Node.js / JavaScript | 18+ |
| Frontend framework | React + Vite | 18 / 5+ |
| Frontend styling | Tailwind CSS | 3+ |
| Mapas | Leaflet.js | 1.9+ |
| Arquitectura | Modular Monolith con Clean Architecture | - |

> **Nota**: Microservicios en contexto del hackathon = Modular Monolith con modulos desacoplados via Protocolos Python.

## Data Specification

### 4 Registros Obligatorios (FR-009)

> **Nota A-005**: Los valores de La Joya y Altiplano fueron recalibrados para garantizar
> determinismo de SC-002a/b/c con el algoritmo euclidiano ponderado. Los valores originales
> de diseño (tempMax:28.5, pressure:1013 para La Joya; tempMax:15, pressure:580 para Altiplano)
> fueron reemplazados por los valores calibrados abajo. Enmienda ratificada 2026-11-15.

| Campo | La Joya | Altiplano | Andagua | Yungay |
|-------|---------|-----------|---------|--------|
| lat | -16.4800 | -15.8300 | -15.6000 | -24.0800 |
| lng | -71.9800 | -71.4700 | -72.3000 | -69.8500 |
| tempMax | **35.0** | **-20.0** | 22.0 | 25.0 |
| tempMin | **-33.0** | **-230.0** | 2.0 | -5.0 |
| pressure | **1.5** | **0.0** | 950.0 | 1008.0 |
| solarRad | **5.8** | **14.0** | 6.5 | 7.5 |
| uvIndex | **0.5** | **22.0** | 12.0 | 13.0 |
| loc | **10.5** | **5.0** | 45.0 | 15.0 |
| friction | **0.61** | **0.48** | 0.85 | 0.60 |
| cohesion | **0.51** | **0.30** | 0.70 | 0.35 |

> Valores en **negrita** = recalibrados para determinismo SC-002. Original en research.md.

### CV Mock Fixture (determinista, siempre igual)
tempMax: -20.0, tempMin: -230.0, pressure: **0.0** (vacío lunar), solarRad: 14.0, uvIndex: 22.0, loc: 5.0, friction: 0.48, cohesion: 0.30, model: NASA-IBM Lunar Foundation Model v1.0-mock, confidence: 0.87

### Pesos del Algoritmo Euclidiano
thermal_amplitude: 3.0 | pressure: 2.0 | solarRad: 1.5 | uvIndex: 1.5 | loc: 1.0 | friction: 1.0 | cohesion: 0.5

## Governance

- Esta Constitution supersede cualquier otra practica o decision de implementacion.
- Cualquier violacion de los principios I y II es un defecto CRITICO que bloquea el avance.
- Enmiendas requieren documentacion explicita de la decision, justificacion y plan de migracion.
- El z-index del HUD (1005) y los valores numericos de los 4 puntos NO son negociables sin actualizacion formal.

**Version**: 1.0.0 | **Ratified**: 2026-11-15 | **Last Amended**: 2026-11-15
