/**
 * useAnalogSearch — ejecuta búsqueda de análogos (US1)
 * POST /api/v1/analogs/search → top-5 resultados.
 */
import { useState } from 'react'
import type { AnalogSearchResult, SearchStatus, SpaceTarget } from '../../domain/types'
import { searchAnalogs } from '../../infrastructure/api/analogClient'

export interface UseAnalogSearchState {
  results: AnalogSearchResult[]
  status: SearchStatus
  error: string | null
  search: (target: SpaceTarget) => Promise<void>
  reset: () => void
}

export function useAnalogSearch(): UseAnalogSearchState {
  const [results, setResults] = useState<AnalogSearchResult[]>([])
  const [status, setStatus] = useState<SearchStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const search = async (target: SpaceTarget) => {
    setStatus('loading')
    setError(null)
    try {
      const response = await searchAnalogs(target, 5)
      setResults(response.results)
      setStatus('success')
    } catch (err) {
      setError((err as Error).message)
      setStatus('error')
    }
  }

  const reset = () => {
    setResults([])
    setStatus('idle')
    setError(null)
  }

  return { results, status, error, search, reset }
}
