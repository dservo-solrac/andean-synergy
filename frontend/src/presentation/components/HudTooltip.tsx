/**
 * HudTooltip — Tooltip HUD Holográfico (FR-021, A-008)
 * ======================================================
 * z-index: 1005 (canónico, Constitution §5)
 * Muestra: Nombre, Lat/Lon (4 decimales), ΔT (°C), LOC (g/kg)
 * Check 8 del quickstart.md.
 */
import type { AnalogLocation } from '../../domain/types'

interface HudTooltipProps {
  analog: AnalogLocation
  x: number
  y: number
}

export function HudTooltip({ analog, x, y }: HudTooltipProps) {
  const deltaT = analog.tempMax - analog.tempMin

  // Offset para no tapar el cursor
  const left = x + 16
  const top = y - 10

  return (
    <div
      className="absolute pointer-events-none select-none font-mono text-xs"
      style={{
        left,
        top,
        zIndex: 1005,
        minWidth: '220px',
      }}
    >
      {/* Panel HUD principal */}
      <div
        className="hud-glow"
        style={{
          background: 'rgba(5, 15, 25, 0.92)',
          border: '1px solid var(--color-cyan)',
          borderLeft: '3px solid var(--color-cyan)',
          padding: '10px 12px',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 0 20px rgba(0,245,255,0.2), inset 0 0 10px rgba(0,245,255,0.03)',
        }}
      >
        {/* Encabezado */}
        <div
          className="text-xs font-bold mb-2 tracking-widest"
          style={{ color: 'var(--color-cyan)', letterSpacing: '0.15em' }}
        >
          ◈ ANALOG SITE DETECTED
        </div>

        {/* Nombre */}
        <div className="mb-2" style={{ color: '#e0f4ff', fontWeight: 600, fontSize: '11px' }}>
          {analog.name}
        </div>

        {/* Grid de datos */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1" style={{ color: 'var(--color-text-dim)' }}>
          <span className="text-right" style={{ color: 'var(--color-cyan-dim)' }}>LAT</span>
          <span style={{ color: 'var(--color-text)' }}>{analog.lat.toFixed(4)}°</span>

          <span className="text-right" style={{ color: 'var(--color-cyan-dim)' }}>LON</span>
          <span style={{ color: 'var(--color-text)' }}>{analog.lng.toFixed(4)}°</span>

          <span className="text-right" style={{ color: 'var(--color-amber)' }}>ΔT</span>
          <span style={{ color: 'var(--color-amber)' }}>{deltaT.toFixed(1)} °C</span>

          <span className="text-right" style={{ color: 'var(--color-cyan-dim)' }}>LOC</span>
          <span style={{ color: 'var(--color-text)' }}>{analog.loc.toFixed(1)} g/kg</span>

          <span className="text-right" style={{ color: 'var(--color-cyan-dim)' }}>P</span>
          <span style={{ color: 'var(--color-text)' }}>{analog.pressure.toFixed(0)} hPa</span>
        </div>

        {/* Indicador "KEY ANALOG" para los 4 obligatorios */}
        {analog.isKeyAnalog && (
          <div
            className="mt-2 text-center tracking-widest"
            style={{ color: 'var(--color-amber)', fontSize: '9px', borderTop: '1px solid #2a2a00', paddingTop: '6px' }}
          >
            ★ CALIBRATION ANALOG
          </div>
        )}
      </div>
    </div>
  )
}
