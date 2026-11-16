/**
 * Domain Types — Planet Analog Search Engine (Frontend)
 * ======================================================
 * Espejo de las entidades del backend. Alineadas con:
 *   - data-model.md §Tipos TypeScript
 *   - contracts/api-contracts.md §Schemas
 *
 * Capa: domain/ — sin imports de infrastructure o presentation.
 */

// ─── Entidades ─────────────────────────────────────────────────────────────────

export interface AnalogLocation {
  id: string
  name: string
  lat: number
  lng: number
  tempMax: number
  tempMin: number
  pressure: number
  solarRad: number
  uvIndex: number
  loc: number
  friction: number
  cohesion: number
  isKeyAnalog?: boolean
}

export interface SpaceTarget {
  tempMax: number
  tempMin: number
  pressure: number
  solarRad: number
  uvIndex: number
  loc: number
  friction: number
  cohesion: number
}

export interface AnalogSearchResult {
  rank: number
  similarity_score: number   // [0,1] — spec.md §US1-AC1 naming canónico
  analog: AnalogLocation
}

export interface CVInferenceResult {
  tempMax: number
  tempMin: number
  pressure: number
  solarRad: number
  uvIndex: number
  loc: number
  friction: number
  cohesion: number
  model: string
  confidence: number
}

// ─── API Response Shapes ───────────────────────────────────────────────────────

export interface SearchResponse {
  results: AnalogSearchResult[]
  query: SpaceTarget
  total_candidates: number
}

export interface AnalogPage {
  items: AnalogLocation[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface CVAnalyzeResponse {
  inference: CVInferenceResult
  filename: string
  size_bytes: number
}

export interface HealthResponse {
  status: string
  service: string
  version: string
  analog_count: number
  timestamp: string
}

// ─── UI State Types ────────────────────────────────────────────────────────────

export type CVStatus = 'idle' | 'uploading' | 'success' | 'error'

export type SearchStatus = 'idle' | 'loading' | 'success' | 'error'
