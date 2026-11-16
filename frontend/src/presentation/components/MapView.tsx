/**
 * MapView — Mapa Leaflet con 1000 análogos (SC-004, US3)
 * ========================================================
 * - Fondo: ESRI World Dark Gray Canvas (SC-007 fallback: OSM)
 * - 1000 CircleMarker con L.canvas() renderer (performance SC-004 < 3s)
 * - 4 puntos obligatorios: color amber (dorado), resto: cyan
 * - Hover → HudTooltip (z-index 1005, A-008)
 * - Click → callback onSelectAnalog
 */
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useRef, useState } from 'react'
import type { AnalogLocation } from '../../domain/types'
import { HudTooltip } from './HudTooltip'

interface MapViewProps {
  analogs: AnalogLocation[]
  selectedAnalog: AnalogLocation | null
  searchResults: AnalogLocation[]
  onSelectAnalog: (analog: AnalogLocation) => void
}

// ESRI Dark Canvas — tile para demo Sci-Fi
const ESRI_DARK =
  'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
const ESRI_ATTR = 'Esri, HERE, Garmin, OpenStreetMap'

// OSM Fallback (CHK031 — SC-007)
const OSM_TILE = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const OSM_ATTR = '© OpenStreetMap contributors'

// Colores Sci-Fi — valores canónicos de Constitution §V
const COLOR_CYAN = '#06b6d4'   // Tailwind cyan-500 canónico
const COLOR_AMBER = '#f59e0b'  // Tailwind amber-500 canónico
const COLOR_RESULT = '#00ff88'

export function MapView({ analogs, selectedAnalog, searchResults, onSelectAnalog }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<Map<string, L.CircleMarker>>(new Map())
  const [hoveredAnalog, setHoveredAnalog] = useState<AnalogLocation | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  const resultIds = new Set(searchResults.map((a) => a.id))

  // Inicializar mapa una sola vez
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return

    const map = L.map(containerRef.current, {
      center: [-20, -65],
      zoom: 3,
      zoomControl: true,
      attributionControl: true,
    })

    // ESRI Dark Canvas con fallback OSM (CHK031)
    const esriLayer = L.tileLayer(ESRI_DARK, {
      attribution: ESRI_ATTR,
      maxZoom: 16,
      errorTileUrl: '', // suppress broken tile errors
    })

    esriLayer.on('tileerror', () => {
      if (!map.hasLayer(osmFallback)) {
        map.removeLayer(esriLayer)
        osmFallback.addTo(map)
      }
    })

    const osmFallback = L.tileLayer(OSM_TILE, {
      attribution: OSM_ATTR,
      maxZoom: 19,
    })

    esriLayer.addTo(map)
    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Actualizar marcadores cuando cambian los análogos (1 render único)
  useEffect(() => {
    const map = mapRef.current
    if (!map || analogs.length === 0) return

    // Canvas renderer para performance SC-004
    const renderer = L.canvas({ padding: 0.5 })

    // Limpiar marcadores previos
    markersRef.current.forEach((m) => m.remove())
    markersRef.current.clear()

    analogs.forEach((analog) => {
      const isKey = analog.isKeyAnalog === true
      const isResult = resultIds.has(analog.id)
      const isSelected = selectedAnalog?.id === analog.id

      const color = isSelected
        ? '#ffffff'
        : isResult
          ? COLOR_RESULT
          : isKey
            ? COLOR_AMBER
            : COLOR_CYAN

      const radius = isSelected ? 9 : isResult ? 7 : isKey ? 6 : 4
      const opacity = isKey || isResult ? 0.9 : 0.6

      const marker = L.circleMarker([analog.lat, analog.lng], {
        renderer,
        radius,
        color,
        fillColor: color,
        fillOpacity: opacity,
        weight: isSelected ? 2 : 1,
      })

      marker.on('mouseover', (e) => {
        const containerPoint = map.latLngToContainerPoint(e.latlng)
        setTooltipPos({ x: containerPoint.x, y: containerPoint.y })
        setHoveredAnalog(analog)
      })
      marker.on('mouseout', () => setHoveredAnalog(null))
      marker.on('click', () => onSelectAnalog(analog))

      marker.addTo(map)
      markersRef.current.set(analog.id, marker)
    })
  }, [analogs, selectedAnalog?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Actualizar estilos cuando cambian results/selected sin re-crear todos
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const analog = analogs.find((a) => a.id === id)
      if (!analog) return
      const isKey = analog.isKeyAnalog === true
      const isResult = resultIds.has(id)
      const isSelected = selectedAnalog?.id === id

      const color = isSelected ? '#ffffff' : isResult ? COLOR_RESULT : isKey ? COLOR_AMBER : COLOR_CYAN
      const radius = isSelected ? 9 : isResult ? 7 : isKey ? 6 : 4
      const opacity = isKey || isResult ? 0.9 : 0.6

      marker.setStyle({
        color, fillColor: color, fillOpacity: opacity, radius, weight: isSelected ? 2 : 1,
      })
    })
  }, [selectedAnalog?.id, searchResults]) // eslint-disable-line react-hooks/exhaustive-deps

  // Volar al análogo seleccionado
  useEffect(() => {
    if (selectedAnalog && mapRef.current) {
      mapRef.current.flyTo([selectedAnalog.lat, selectedAnalog.lng], 7, { duration: 1.2 })
    }
  }, [selectedAnalog?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {/* HUD Tooltip (z-index 1005, A-008, FR-021) */}
      {hoveredAnalog && (
        <HudTooltip analog={hoveredAnalog} x={tooltipPos.x} y={tooltipPos.y} />
      )}

      {/* Contador de análogos */}
      <div
        className="absolute bottom-6 left-3 text-xs font-mono px-2 py-1 rounded"
        style={{
          background: 'rgba(5,10,15,0.8)',
          color: 'var(--color-cyan-dim)',
          border: '1px solid var(--color-border)',
          zIndex: 999,
        }}
      >
        ⬡ {analogs.length} ANALOG SITES LOADED
      </div>
    </div>
  )
}
