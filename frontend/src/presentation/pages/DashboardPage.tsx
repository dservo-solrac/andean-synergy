import { useState } from 'react'
import { useAnalogList } from '../../application/hooks/useAnalogList'
import { useAnalogSearch } from '../../application/hooks/useAnalogSearch'
import { useCVAnalyze } from '../../application/hooks/useCVAnalyze'
import type { AnalogLocation, SpaceTarget } from '../../domain/types'
import { ComparisonMatrix } from '../components/ComparisonMatrix'
import { CVUploadPanel } from '../components/CVUploadPanel'
import { MapView } from '../components/MapView'
import { ResultsList } from '../components/ResultsList'
import { SciConsole } from '../components/SciConsole'
import { SearchPanel } from '../components/SearchPanel'

export function DashboardPage() {
  const analogList = useAnalogList()
  const analogSearch = useAnalogSearch()
  const cvAnalyze = useCVAnalyze()
  const [selectedAnalog, setSelectedAnalog] = useState<AnalogLocation | null>(null)
  const [lastTarget, setLastTarget] = useState<SpaceTarget | null>(null)
  const [prefill, setPrefill] = useState<SpaceTarget | null>(null)

  const handleSearch = async (target: SpaceTarget) => {
    setLastTarget(target)
    await analogSearch.search(target)
  }

  const handleCV = async (target: SpaceTarget) => {
    setPrefill(target)
    setLastTarget(target)
    await analogSearch.search(target)
  }

  if (analogSearch.status === 'success' && analogSearch.results.length > 0) {
    const top1 = analogSearch.results[0].analog
    if (top1.id !== selectedAnalog?.id) setSelectedAnalog(top1)
  }

  const searchResultAnalogs = analogSearch.results.map(r => r.analog)
  const panelStyle = {
    width: '300px', minWidth: '300px', height: '100%',
    overflowY: 'auto' as const, display: 'flex',
    flexDirection: 'column' as const, gap: '1px', background: '#020810'
  }

  return (
    <div style={{ display:'flex', width:'100vw', height:'100vh', overflow:'hidden', background:'var(--color-bg)' }}>
      <div style={panelStyle}>
        <div className="font-mono px-3 py-3" style={{ background:'var(--color-panel)', borderBottom:'1px solid var(--color-border)', borderRight:'1px solid var(--color-border)' }}>
          <div style={{ color:'var(--color-cyan)', fontSize:'11px', fontWeight:700, letterSpacing:'0.2em' }}>◈ PLANET ANALOG SEARCH</div>
          <div style={{ color:'var(--color-text-dim)', fontSize:'9px', marginTop:'2px' }}>NASA Space Apps 2026</div>
        </div>
        <div style={{ borderRight:'1px solid var(--color-border)' }}>
          <CVUploadPanel cvState={cvAnalyze} onInferenceComplete={handleCV} />
        </div>
        <div style={{ borderRight:'1px solid var(--color-border)' }}>
          <SearchPanel onSearch={handleSearch} status={analogSearch.status} prefill={prefill} />
        </div>
        {analogSearch.error && (
          <div className="px-3 py-2 font-mono text-xs" style={{ background:'rgba(255,50,50,0.1)', border:'1px solid #ff3333', color:'#ff6666' }}>
            ⚠ {analogSearch.error}
          </div>
        )}
      </div>

      <div style={{ flex:1, position:'relative', overflow:'hidden' }}>
        {analogList.loading && (
          <div style={{ position:'absolute',inset:0,zIndex:2000,background:'rgba(5,10,15,0.9)',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'12px' }}>
            <div style={{ color:'var(--color-cyan)',fontSize:'14px',fontFamily:'monospace',letterSpacing:'0.3em' }}>◈ LOADING ANALOG DATABASE</div>
            <div style={{ color:'var(--color-text-dim)',fontSize:'11px',fontFamily:'monospace' }}>Fetching 1000 terrestrial sites...</div>
          </div>
        )}
        {analogList.error && (
          <div style={{ position:'absolute',inset:0,zIndex:2000,background:'rgba(5,0,0,0.9)',display:'flex',alignItems:'center',justifyContent:'center',color:'#ff4444',fontFamily:'monospace' }}>
            ⚠ Backend unavailable — {analogList.error}
          </div>
        )}
        <MapView analogs={analogList.analogs} selectedAnalog={selectedAnalog} searchResults={searchResultAnalogs} onSelectAnalog={setSelectedAnalog} />
        <div style={{ position:'absolute',top:0,left:0,right:0,zIndex:998,background:'rgba(5,10,15,0.75)',borderBottom:'1px solid var(--color-border)',padding:'4px 12px',display:'flex',alignItems:'center',gap:'16px',fontFamily:'monospace',fontSize:'10px' }}>
          <span style={{ color:'var(--color-cyan)' }}>PLANET ANALOG SEARCH ENGINE</span>
          <span style={{ color:'var(--color-text-dim)' }}>⬡ {analogList.analogs.length} sites</span>
          {analogSearch.status==='success' && <span style={{ color:'var(--color-green)' }}>✓ {analogSearch.results.length} matches</span>}
          {analogSearch.status==='loading' && <span style={{ color:'var(--color-amber)' }}>⟳ Searching...</span>}
        </div>
      </div>

      <div style={{ ...panelStyle }}>
        <div style={{ borderLeft:'1px solid var(--color-border)' }}>
          <ResultsList results={analogSearch.results} selected={selectedAnalog} onSelect={setSelectedAnalog} />
        </div>
        {selectedAnalog && lastTarget && (
          <div style={{ borderLeft:'1px solid var(--color-border)' }}>
            <ComparisonMatrix analog={selectedAnalog} target={lastTarget} />
          </div>
        )}
        {selectedAnalog && (
          <div style={{ borderLeft:'1px solid var(--color-border)' }}>
            <SciConsole analog={selectedAnalog} />
          </div>
        )}
        {!selectedAnalog && (
          <div className="font-mono text-xs p-4 text-center" style={{ borderLeft:'1px solid var(--color-border)',color:'var(--color-text-dim)',background:'var(--color-panel)',flex:1 }}>
            <div style={{ color:'var(--color-cyan-dim)',marginBottom:'8px',letterSpacing:'0.15em' }}>◈ AWAITING SELECTION</div>
            <div style={{ fontSize:'10px' }}>Execute a search or click a marker</div>
          </div>
        )}
      </div>
    </div>
  )
}
