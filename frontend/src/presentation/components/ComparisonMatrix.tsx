/**
 * ComparisonMatrix — Comparación visual Target vs Análogo (FR-022, A-010)
 * ========================================================================
 * Barras cyan = Target Espacial, amber = Análogo Terrestre.
 * CHK030: valores negativos (ej. temperaturas) → barra desde centro hacia izquierda.
 * A-010: compara Top-1 seleccionado vs Target (1-a-1).
 */
import type { AnalogLocation, SpaceTarget } from '../../domain/types'

interface ComparisonMatrixProps {
  analog: AnalogLocation
  target: SpaceTarget
}

interface MetricRow {
  label: string
  unit: string
  targetVal: number
  analogVal: number
  absMax: number    // para escalar barras simétricamente
  canBeNegative: boolean
}

function buildRows(analog: AnalogLocation, target: SpaceTarget): MetricRow[] {
  const rows: Omit<MetricRow, 'absMax'>[] = [
    { label: 'Temp MAX', unit: '°C', targetVal: target.tempMax, analogVal: analog.tempMax, canBeNegative: true },
    { label: 'Temp MIN', unit: '°C', targetVal: target.tempMin, analogVal: analog.tempMin, canBeNegative: true },
    { label: 'ΔT Amplitude', unit: '°C', targetVal: target.tempMax - target.tempMin, analogVal: analog.tempMax - analog.tempMin, canBeNegative: false },
    { label: 'Pressure', unit: 'hPa', targetVal: target.pressure, analogVal: analog.pressure, canBeNegative: false },
    { label: 'Solar Rad', unit: 'kWh/m²', targetVal: target.solarRad, analogVal: analog.solarRad, canBeNegative: false },
    { label: 'UV Index', unit: '', targetVal: target.uvIndex, analogVal: analog.uvIndex, canBeNegative: false },
    { label: 'LOC', unit: 'g/kg', targetVal: target.loc, analogVal: analog.loc, canBeNegative: false },
    { label: 'Friction', unit: '', targetVal: target.friction, analogVal: analog.friction, canBeNegative: false },
  ]
  return rows.map((r) => ({
    ...r,
    absMax: Math.max(Math.abs(r.targetVal), Math.abs(r.analogVal), 0.001),
  }))
}

function Bar({
  value,
  absMax,
  canBeNegative,
  color,
}: {
  value: number
  absMax: number
  canBeNegative: boolean
  color: string
}) {
  if (canBeNegative) {
    // CHK030: escala simétrica centrada. Negativo → crece hacia la izquierda.
    const pct = Math.min(Math.abs(value) / absMax, 1) * 50 // max 50% desde el centro
    const isNeg = value < 0
    return (
      <div className="relative w-full" style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
        {/* Centro */}
        <div className="absolute top-0 bottom-0" style={{ left: '50%', width: '1px', background: 'rgba(255,255,255,0.15)' }} />
        {/* Barra */}
        <div
          className="absolute top-0 h-full score-bar rounded"
          style={{
            right: isNeg ? `${50 - pct}%` : '50%',
            left: isNeg ? '50%' : `${50 - pct}%`,
            background: color,
            boxShadow: `0 0 4px ${color}88`,
          }}
        />
      </div>
    )
  }
  // Positivo: barra normal de izquierda a derecha
  const pct = Math.min(value / absMax, 1) * 100
  return (
    <div className="relative w-full" style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
      <div
        className="absolute top-0 left-0 h-full score-bar rounded"
        style={{ width: `${pct}%`, background: color, boxShadow: `0 0 4px ${color}88` }}
      />
    </div>
  )
}

export function ComparisonMatrix({ analog, target }: ComparisonMatrixProps) {
  const rows = buildRows(analog, target)

  return (
    <div
      className="font-mono"
      style={{
        background: 'var(--color-panel)',
        border: '1px solid var(--color-border)',
        borderTop: '2px solid var(--color-amber)',
      }}
    >
      {/* Header */}
      <div
        className="px-3 py-2 tracking-widest text-xs font-bold flex justify-between"
        style={{ color: 'var(--color-amber)', borderBottom: '1px solid var(--color-border)' }}
      >
        <span>◈ COMPARISON MATRIX</span>
        <span style={{ fontSize: '9px', color: 'var(--color-text-dim)' }}>
          <span style={{ color: 'var(--color-cyan)' }}>■ TARGET</span>
          {'  '}
          <span style={{ color: 'var(--color-amber)' }}>■ ANALOG</span>
        </span>
      </div>

      {/* Nombre del análogo */}
      <div
        className="px-3 py-1 text-xs"
        style={{ color: 'var(--color-amber)', borderBottom: '1px solid var(--color-border)', fontSize: '10px' }}
      >
        {analog.name}
      </div>

      {/* Filas de métricas */}
      <div className="p-3 space-y-3">
        {rows.map((row) => (
          <div key={row.label}>
            {/* Label + valores */}
            <div className="flex justify-between mb-1" style={{ fontSize: '10px' }}>
              <span style={{ color: 'var(--color-text-dim)' }}>{row.label}</span>
              <div className="flex gap-3">
                <span style={{ color: 'var(--color-cyan)' }}>
                  {row.targetVal.toFixed(row.unit === 'hPa' ? 3 : 1)}{row.unit && ` ${row.unit}`}
                </span>
                <span style={{ color: 'var(--color-amber)' }}>
                  {row.analogVal.toFixed(row.unit === 'hPa' ? 3 : 1)}{row.unit && ` ${row.unit}`}
                </span>
              </div>
            </div>
            {/* Barras */}
            <Bar value={row.targetVal} absMax={row.absMax} canBeNegative={row.canBeNegative} color="var(--color-cyan)" />
            <div className="mt-1">
              <Bar value={row.analogVal} absMax={row.absMax} canBeNegative={row.canBeNegative} color="var(--color-amber)" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
