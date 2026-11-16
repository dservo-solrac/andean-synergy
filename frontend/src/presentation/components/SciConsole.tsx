/**
 * SciConsole — Consola Científica con cURL dinámico (FR-024, A-009)
 * ==================================================================
 * Genera cURL real con lat/lon del análogo seleccionado.
 * Endpoint: NASA POWER API (power.larc.nasa.gov).
 * Check 11 del quickstart.md.
 */
import type { AnalogLocation } from '../../domain/types'

interface SciConsoleProps {
  analog: AnalogLocation
}

function todayYYYYMMDD(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}${m}${day}`
}

function buildCurlCommand(analog: AnalogLocation): string {
  const date = todayYYYYMMDD()
  const lat = analog.lat.toFixed(4)
  const lon = analog.lng.toFixed(4)
  return [
    `curl -G "https://power.larc.nasa.gov/api/temporal/daily/point" \\`,
    `  --data-urlencode "parameters=T2M,PRECTOTCORR,ALLSKY_SFC_SW_DWN" \\`,
    `  --data-urlencode "community=RE" \\`,
    `  --data-urlencode "longitude=${lon}" \\`,
    `  --data-urlencode "latitude=${lat}" \\`,
    `  --data-urlencode "start=${date}" \\`,
    `  --data-urlencode "end=${date}" \\`,
    `  --data-urlencode "format=JSON"`,
  ].join('\n')
}

export function SciConsole({ analog }: SciConsoleProps) {
  const curlCmd = buildCurlCommand(analog)

  const handleCopy = () => {
    navigator.clipboard.writeText(curlCmd).catch(() => {/* silent */})
  }

  return (
    <div
      className="font-mono"
      style={{
        background: '#030b05',
        border: '1px solid #0a2a12',
        borderTop: '2px solid var(--color-green)',
      }}
    >
      {/* Header */}
      <div
        className="px-3 py-2 tracking-widest text-xs font-bold flex justify-between items-center"
        style={{ color: 'var(--color-green)', borderBottom: '1px solid #0a2a12' }}
      >
        <span>◈ SCIENTIFIC CONSOLE</span>
        <button
          onClick={handleCopy}
          className="text-xs px-2 py-0.5 rounded"
          style={{
            background: 'rgba(0,255,136,0.08)',
            border: '1px solid rgba(0,255,136,0.3)',
            color: 'var(--color-green)',
            cursor: 'pointer',
            fontSize: '9px',
          }}
        >
          COPY
        </button>
      </div>

      {/* Info del análogo */}
      <div
        className="px-3 py-1 text-xs"
        style={{ color: 'var(--color-text-dim)', borderBottom: '1px solid #0a2a12', fontSize: '10px' }}
      >
        <span style={{ color: 'var(--color-green)' }}>SITE:</span>{' '}
        {analog.name}
        <span style={{ marginLeft: '12px', color: 'var(--color-text-dim)' }}>
          {analog.lat.toFixed(4)}°N {analog.lng.toFixed(4)}°E
        </span>
      </div>

      {/* Bloque cURL */}
      <div className="p-3">
        <div
          style={{ color: '#3a7a3a', fontSize: '9px', marginBottom: '6px', letterSpacing: '0.1em' }}
        >
          # NASA POWER API — Temporal Daily Point Query
        </div>
        <pre
          className="whitespace-pre-wrap break-all rounded p-3"
          style={{
            background: 'rgba(0,20,5,0.8)',
            border: '1px solid #0a2a12',
            color: '#00cc66',
            fontSize: '10px',
            lineHeight: '1.6',
            overflow: 'auto',
            maxHeight: '160px',
          }}
        >
          {curlCmd}
        </pre>
        <div
          className="mt-2 text-right"
          style={{ color: '#2a5a2a', fontSize: '9px' }}
        >
          Date: {todayYYYYMMDD()} · Educational component — not executed
        </div>
      </div>
    </div>
  )
}
