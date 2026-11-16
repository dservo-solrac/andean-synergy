/**
 * ResultsList — Top-5 resultados de búsqueda (US1, FR-012)
 * ==========================================================
 * Score bars: cyan para target, amber para análogo seleccionado.
 * Click en resultado → selecciona análogo en el mapa.
 */
import type { AnalogLocation, AnalogSearchResult } from '../../domain/types'

interface ResultsListProps {
  results: AnalogSearchResult[]
  selected: AnalogLocation | null
  onSelect: (analog: AnalogLocation) => void
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.round(score * 100)
  return (
    <div className="mt-1 relative" style={{ height: '4px', background: 'rgba(0,245,255,0.1)', borderRadius: '2px' }}>
      <div
        className="score-bar absolute top-0 left-0 h-full rounded"
        style={{
          width: `${pct}%`,
          background: `linear-gradient(90deg, var(--color-cyan-dim), var(--color-cyan))`,
          boxShadow: '0 0 6px rgba(0,245,255,0.5)',
        }}
      />
    </div>
  )
}

export function ResultsList({ results, selected, onSelect }: ResultsListProps) {
  if (results.length === 0) {
    return (
      <div
        className="font-mono text-xs p-4 text-center"
        style={{
          background: 'var(--color-panel)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-dim)',
        }}
      >
        <div className="mb-1" style={{ color: 'var(--color-cyan)', letterSpacing: '0.15em' }}>
          ◈ TOP-5 ANALOG MATCHES
        </div>
        Execute search to display results
      </div>
    )
  }

  return (
    <div
      className="font-mono"
      style={{
        background: 'var(--color-panel)',
        border: '1px solid var(--color-border)',
        borderTop: '2px solid var(--color-cyan)',
      }}
    >
      {/* Header */}
      <div
        className="px-3 py-2 tracking-widest text-xs font-bold"
        style={{ color: 'var(--color-cyan)', borderBottom: '1px solid var(--color-border)' }}
      >
        ◈ TOP-{results.length} ANALOG MATCHES
      </div>

      {results.map((result) => {
        const isSelected = selected?.id === result.analog.id
        const pct = Math.round(result.similarity_score * 100)
        return (
          <div
            key={result.analog.id}
            onClick={() => onSelect(result.analog)}
            className="px-3 py-2 cursor-pointer"
            style={{
              borderBottom: '1px solid var(--color-border)',
              background: isSelected ? 'rgba(0,245,255,0.08)' : 'transparent',
              borderLeft: isSelected ? '3px solid var(--color-cyan)' : '3px solid transparent',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'rgba(0,245,255,0.04)'
            }}
            onMouseLeave={(e) => {
              if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'transparent'
            }}
          >
            {/* Rank + score */}
            <div className="flex items-center justify-between mb-1">
              <span
                className="text-xs font-bold"
                style={{ color: result.rank === 1 ? 'var(--color-amber)' : 'var(--color-cyan-dim)' }}
              >
                #{result.rank}
              </span>
              <span className="text-xs" style={{ color: 'var(--color-cyan)', fontWeight: 700 }}>
                {pct}%
              </span>
            </div>

            {/* Nombre */}
            <div
              className="text-xs mb-1"
              style={{
                color: isSelected ? 'var(--color-cyan)' : 'var(--color-text)',
                fontWeight: isSelected ? 700 : 400,
                fontSize: '11px',
              }}
            >
              {result.analog.name}
            </div>

            {/* Score bar */}
            <ScoreBar score={result.similarity_score} />

            {/* Coordenadas */}
            <div className="mt-1 text-right" style={{ color: 'var(--color-text-dim)', fontSize: '9px' }}>
              {result.analog.lat.toFixed(2)}°, {result.analog.lng.toFixed(2)}°
              {result.analog.isKeyAnalog && (
                <span style={{ color: 'var(--color-amber)', marginLeft: '6px' }}>★ KEY</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
