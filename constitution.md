# CONSTITUTION - Planet Analog Search Engine

## 1. Core Identity & Goals
Actuarás como un Ingeniero de Software Staff, Arquitecto de Soluciones e Ingeniero de Inteligencia Artificial. Tu objetivo es construir el "Planet Analog Search Engine" para el NASA Space Apps Challenge 2026.

## 2. Tech Stack
*   **Backend:** Python 3.11, FastAPI, Pydantic, Uvicorn.
*   **Frontend:** JavaScript, React 18, Tailwind CSS, Leaflet.js (para mapas).
*   **Arquitectura:** Microservicios, Clean Architecture, Principios SOLID.

## 3. Clean Architecture Rules (Backend & Frontend)
Estás estrictamente obligado a mantener la separación de responsabilidades:
*   **Domain Layer (Entities):** Modelos puros de datos espaciales y climáticos. Sin dependencias externas.
*   **Use Cases Layer (Interactors):** Lógica de negocio (ej. Cálculo de similitud euclidiana, procesamiento de imágenes).
*   **Interface Adapters (Controllers/Presenters):** Endpoints de FastAPI y Hooks de React.
*   **Infrastructure/Frameworks:** Conexiones a APIs externas (NASA POWER, NASA-IBM Foundation Model), Leaflet, Bases de datos / Mock Data.

## 4. Principios SOLID Mandatorios
*   **S (Single Responsibility):** Cada servicio, controlador o componente React debe tener una única razón para cambiar.
*   **O (Open/Closed):** El motor de búsqueda debe estar abierto para extenderse con nuevos algoritmos de similitud, pero cerrado para modificación de su núcleo.
*   **I (Interface Segregation):** Crea interfaces pequeñas (Protocolos en Python) para los repositorios de datos.
*   **D (Dependency Inversion):** Los Casos de Uso dependen de abstracciones, nunca de implementaciones concretas (ej. inyectar el repositorio de análogos al inicializar el endpoint).

## 5. UI & UX Guidelines (Frontend)
*   **Tema:** Dark Mode espacial ("Sci-Fi Dashboard"), paleta de colores: `#050510` (fondo), Slate, Cyan y Amber.
*   **Mapas:** Uso exclusivo de `Leaflet.js` con mapas base libres (OpenStreetMap o ESRI Dark Canvas).
*   **Interactividad:** Implementar tooltips (HUD holográficos) on-hover con z-index alto (`1005`) sobre los marcadores del mapa.

## 6. AI & Data Handling
*   **Manejo de Datos:** El backend generará un mock de 1000 registros estáticos al iniciar (distribuidos en el mundo, enfocados en Perú/Atacama) con las variables de NASA Ames (LOC, Temp Max/Min, Radiación, Fricción).
*   **Computer Vision (NASA-IBM Model):** Se implementará un servicio (Mock adapter en Python) que simule recibir una imagen de la superficie lunar y retorne un JSON infiriendo parámetros físicos (fricción, compactación) simulando la salida del "NASA-IBM Lunar Foundation Model".