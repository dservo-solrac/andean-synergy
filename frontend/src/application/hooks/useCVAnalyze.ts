/**
 * useCVAnalyze — sube imagen al NASA-IBM mock (US2)
 * POST /api/v1/cv/analyze multipart → CVInferenceResult fixture.
 */
import { useState } from 'react'
import type { CVInferenceResult, CVStatus } from '../../domain/types'
import { analyzeImage } from '../../infrastructure/api/analogClient'

export interface UseCVAnalyzeState {
  result: CVInferenceResult | null
  status: CVStatus
  error: string | null
  analyze: (file: File) => Promise<CVInferenceResult | null>
  reset: () => void
}

export function useCVAnalyze(): UseCVAnalyzeState {
  const [result, setResult] = useState<CVInferenceResult | null>(null)
  const [status, setStatus] = useState<CVStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const analyze = async (file: File): Promise<CVInferenceResult | null> => {
    setStatus('uploading')
    setError(null)
    try {
      const response = await analyzeImage(file)
      setResult(response.inference)
      setStatus('success')
      return response.inference
    } catch (err) {
      setError((err as Error).message)
      setStatus('error')
      return null
    }
  }

  const reset = () => {
    setResult(null)
    setStatus('idle')
    setError(null)
  }

  return { result, status, error, analyze, reset }
}
