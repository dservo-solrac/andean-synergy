# Especificación del Sistema - Planet Analog Search Engine

## 1. Visión General
Desarrollar una aplicación web (Backend en Python/FastAPI, Frontend en React/Vite) para el NASA Space Apps Challenge 2026. La app identifica análogos terrestres para misiones lunares y marcianas utilizando una arquitectura "Zero-Database" federada (simulada) y algoritmos de similitud paramétrica.

## 2. Requerimientos de Arquitectura (Obligatorio)
Ambos proyectos (Backend y Frontend) deben residir en el mismo repositorio (monorepo) y aplicar estrictamente **Clean Architecture** y principios **SOLID**.
*   **Backend (`/backend`):** Python 3.11, FastAPI, Pydantic. Estructura: `domain/`, `use_cases/`, `adapters/` (Controladores), `infrastructure/`.
*   **Frontend (`/frontend`):** React 18, Tailwind CSS, Vite. Estructura: `domain/`, `application/`, `presentation/`, `infrastructure/`.

## 3. Requerimiento de Datos (Mocking)
En lugar de conectar una base de datos real, el backend debe generar dinámicamente un archivo o estructura en memoria con **1000 registros de ubicaciones terrestres** al inicializarse. 
*   Los datos deben ser realistas e incluir campos: `id`, `name`, `lat`, `lng`, `tempMax`, `tempMin`, `pressure`, `solarRad`, `uvIndex`, `loc` (Carbono Orgánico Lábil), `friction`, `cohesion`.
*   **MANDATORIO:** Entre estos 1000 registros, DEBEN existir 4 registros inyectados con valores específicos basados en la literatura de NASA Ames:
    1. "Mar de Cuarzo (Pampas de La Joya)" (Estéril, LOC < 15, temp amplitud alta).
    2. "Altiplano (Laguna Salinas / Aguada Blanca)" (Presión baja, UV extremo, noches bajo cero).
    3. "Valle de los Volcanes de Andagua" (Alta fricción, basalto, temp templada).
    4. "Desierto de Atacama (Yungay)" (LOC moderado-bajo, hiperárido).

## 4. Funcionalidades Core (Casos de Uso)
1.  **Motor de Similitud Euclidiana (`AnalogSearchService`):** Recibe parámetros espaciales objetivo (Ej. Marte: TempMax -14, TempMin -82, Presión 0.6) y busca entre los 1000 registros terrestres el que tenga menor distancia matemática (mayor similitud). Debe ponderar especialmente la Amplitud Térmica (TempMax - TempMin).
2.  **Módulo NASA-IBM Lunar Foundation Model (`ComputerVisionService`):** Un mock service. Recibe un archivo de imagen, simula 2 segundos de procesamiento, y retorna un JSON con inferencia de variables físicas (ej. TempMax -20, TempMin -230, presión 0, radiación 14, fricción 48).

## 5. Requerimientos de Interfaz (UI/UX)
*   **Estética:** Dark Mode Sci-Fi, colores negro (`#050510`), cyan, amber y slate.
*   **Mapa 3D/2D:** Uso exclusivo de `Leaflet.js` con el mapa base 'ESRI Dark Canvas' (`https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`).
*   **HUD Holográfico:** Al hacer hover (`onMouseOver`) sobre un punto en el mapa, debe aparecer un popup/tooltip con z-index superior a 1000 mostrando Lat/Lon, Amplitud Térmica y LOC.
*   **Matriz Comparativa:** Al seleccionar un análogo, mostrar barras comparativas de Extremos Térmicos (Día vs Noche), Presión y Radiación Solar (Target Espacial vs Análogo Terrestre).
*   **Upload CV:** Un área drag & drop para simular la subida de una foto y procesarla con la IA.
*   **Consola Cinetífica:** Un panel inferior simulando la generación del código `cURL` para consumir la API de `NASA POWER`.

## 6. Casos de Prueba de Integración
La aplicación debe pasar estas tres simulaciones de negocio:
1.  **Simulación de Esterilidad (Marte - Cráter Jezero):** Al ingresar parámetros marcianos (baja temp, baja presión), el sistema DEBE mapear a "Mar de Cuarzo" o "Yungay" y mostrar el gráfico de amplitud térmica.
2.  **Extracción con IA Multimodal (Luna - Polo Sur):** Al cargar una foto en el panel NASA-IBM, debe autocompletar la UI con parámetros criogénicos y de alta radiación, y el motor debe mapear al "Altiplano".
3.  **Terreno Basáltico (Rovers):** Si se prioriza alta fricción y terreno accidentado, debe mapear al "Valle de los Volcanes de Andagua".