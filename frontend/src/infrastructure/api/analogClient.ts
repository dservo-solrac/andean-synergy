/**
 * Analog API Client — Planet Analog Search Engine (Frontend)
 * ===========================================================
 * Infrastructure Layer: fetch wrapper hacia el backend FastAPI.
 * Base URL: /api (proxied by Vite → http://localhost:8000)
 *
 * Sin side-effects: funciones puras que retornan Promises.
 * Error handling: lanza Error con mensaje descriptivo para los hooks.
 */

import type {
  AnalogPage,
  CVAnalyzeResponse,
  SearchResponse,
  SpaceTarget,
} from '../../domain/types'

const BASE = '/api/v1'

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = `HTTP ${res.status}`
    try {
      const body = await res.json()
      detail = body?.detail ?? detail
    } catch {
      /* ignore parse error */
    }
    throw new Error(detail)
  }
  return res.json() as Promise<T>
}

/** GET /api/v1/analogs?page=N&page_size=200 */
export async function fetchAnalogsPage(page: number, pageSize = 200): Promise<AnalogPage> {
  const res = await fetch(`${BASE}/analogs/?page=${page}&page_size=${pageSize}`)
  return handleResponse<AnalogPage>(res)
}

/** Carga todos los 1000 análogos en 5 requests paralelas (200 × 5) */
export async function fetchAllAnalogs(): Promise<AnalogPage['items']> {
  const pages = await Promise.all(
    [1, 2, 3, 4, 5].map((p) => fetchAnalogsPage(p, 200))
  )
  return pages.flatMap((p) => p.items)
}

/** POST /api/v1/analogs/search */
export async function searchAnalogs(
  target: SpaceTarget,
  topN = 5
): Promise<SearchResponse> {
  const res = await fetch(`${BASE}/analogs/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target, top_n: topN }),
  })
  return handleResponse<SearchResponse>(res)
}

/** POST /api/v1/cv/analyze — multipart/form-data */
export async function analyzeImage(file: File): Promise<CVAnalyzeResponse> {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${BASE}/cv/analyze`, {
    method: 'POST',
    body: form,
  })
  return handleResponse<CVAnalyzeResponse>(res)
}
