import { useEffect, useState } from 'react'
import type { SearchStatus, SpaceTarget } from '../../domain/types'

interface SearchPanelProps {
  onSearch: (target: SpaceTarget) => void
  status: SearchStatus
  prefill?: SpaceTarget | null
}

const DEFAULTS: SpaceTarget = { tempMax:-14, tempMin:-82, pressure:0.636, solarRad:5.9, uvIndex:0, loc:10, friction:0.6, cohesion:0.5 }
type Field = keyof SpaceTarget

const FIELDS: { key: Field; label: string; unit: string; min: number; max: number; step: number }[] = [
  { key:'tempMax', label:'Temp MAX', unit:'°C', min:-300, max:500, step:0.1 },
  { key:'tempMin', label:'Temp MIN', unit:'°C', min:-300, max:500, step:0.1 },
  { key:'pressure', label:'Pressure', unit:'hPa', min:0, max:10000, step:0.001 },
  { key:'solarRad', label:'Solar Rad', unit:'kWh/m²/d', min:0, max:20, step:0.1 },
  { key:'uvIndex', label:'UV Index', unit:'', min:0, max:100, step:0.1 },
  { key:'loc', label:'LOC', unit:'g/kg', min:0, max:1000, step:0.1 },
  { key:'friction', label:'Friction', unit:'[0-1]', min:0, max:1, step:0.01 },
  { key:'cohesion', label:'Cohesion', unit:'[0-1]', min:0, max:1, step:0.01 },
]

const PRESETS = {
  MARS: { tempMax:-14, tempMin:-82, pressure:0.636, solarRad:5.9, uvIndex:0, loc:10, friction:0.6, cohesion:0.5 },
  MOON: { tempMax:-20, tempMin:-230, pressure:0.001, solarRad:14, uvIndex:22, loc:5, friction:0.48, cohesion:0.30 },
  VOLC: { tempMax:22, tempMin:2, pressure:950, solarRad:6.5, uvIndex:12, loc:45, friction:0.85, cohesion:0.70 },
}

export function SearchPanel({ onSearch, status, prefill }: SearchPanelProps) {
  const [form, setForm] = useState<SpaceTarget>(DEFAULTS)
  useEffect(() => { if (prefill) setForm(prefill) }, [prefill])
  const handleChange = (key: Field, v: number) => setForm(p => ({ ...p, [key]: v }))
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSearch(form) }
  const isLoading = status === 'loading'
  const panelStyle = { background:'var(--color-panel)', border:'1px solid var(--color-border)', borderTop:'2px solid var(--color-cyan)' }
  const hdrStyle = { color:'var(--color-cyan)', borderBottom:'1px solid var(--color-border)' }
  return (
    <div className="font-mono" style={panelStyle}>
      <div className="px-3 py-2 tracking-widest text-xs font-bold" style={hdrStyle}>◈ TARGET PARAMETERS</div>
      <form onSubmit={handleSubmit} className="p-3">
        <div className="flex gap-1 mb-3">
          {Object.entries(PRESETS).map(([name, preset]) => (
            <button key={name} type="button" onClick={() => setForm(preset as SpaceTarget)}
              className="flex-1 py-1 text-xs tracking-wider rounded"
              style={{ background:'rgba(0,245,255,0.05)', border:'1px solid var(--color-border)', color:'var(--color-cyan-dim)', cursor:'pointer' }}>
              {name}
            </button>
          ))}
        </div>
        {FIELDS.map(f => (
          <div key={f.key} className="flex items-center gap-2 mb-1">
            <label className="text-right font-mono" style={{ color:'var(--color-cyan-dim)', fontSize:'10px', minWidth:'65px' }}>{f.label}</label>
            <input type="number" value={form[f.key]} min={f.min} max={f.max} step={f.step}
              onChange={e => handleChange(f.key, parseFloat(e.target.value)||0)}
              className="flex-1 font-mono text-xs px-2 py-1 rounded outline-none"
              style={{ background:'rgba(0,20,35,0.8)', border:'1px solid var(--color-border)', color:'var(--color-text)' }}/>
            <span style={{ color:'var(--color-text-dim)', fontSize:'9px', minWidth:'52px' }}>{f.unit}</span>
          </div>
        ))}
        <button type="submit" disabled={isLoading} className="w-full mt-3 py-2 font-bold tracking-widest text-xs rounded"
          style={{ background:isLoading?'rgba(0,245,255,0.05)':'rgba(0,245,255,0.15)', border:`1px solid ${isLoading?'#1a4a5a':'var(--color-cyan)'}`, color:isLoading?'var(--color-text-dim)':'var(--color-cyan)', cursor:isLoading?'not-allowed':'pointer', boxShadow:isLoading?'none':'0 0 10px rgba(0,245,255,0.2)' }}>
          {isLoading ? '⟳ SEARCHING...' : '▶ EXECUTE SEARCH'}
        </button>
      </form>
    </div>
  )
}
