/**
 * useAnalogList — carga los 1000 análogos al montar (US3)
 * 5 requests paralelas de 200 items cada una.
 */
import { useEffect, useState } from 'react'
import type { AnalogLocation } from '../../domain/types'
import { fetchAllAnalogs } from '../../infrastructure/api/analogClient'

export interface UseAnalogListState {
  analogs: AnalogLocation[]
  loading: boolean
  error: string | null
}

export function useAnalogList(): UseAnalogListState {
  const [analogs, setAnalogs] = useState<AnalogLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchAllAnalogs()
      .then((items) => {
        if (!cancelled) {
          setAnalogs(items)
          setLoading(false)
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message)
          setLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [])

  return { analogs, loading, error }
}
