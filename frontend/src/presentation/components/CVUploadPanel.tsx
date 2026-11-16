import { useCallback, useRef, useState } from 'react'
import type { SpaceTarget } from '../../domain/types'
import type { UseCVAnalyzeState } from '../../application/hooks/useCVAnalyze'

interface CVUploadPanelProps {
  cvState: UseCVAnalyzeState
  onInferenceComplete: (target: SpaceTarget) => void
}

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']
const MAX_MB = 10

export function CVUploadPanel({ cvState, onInferenceComplete }: CVUploadPanelProps) {
  const { status, result, error, analyze } = cvState
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  const processFile = useCallback(async (file: File) => {
    if (!ACCEPTED.includes(file.type)) { alert('Formato no soportado. Por favor carga JPG, PNG o WEBP ≤ 10MB.'); return }
    if (file.size > MAX_MB * 1024 * 1024) { alert('El archivo excede el tamaño máximo de 10MB.'); return }
    setFileName(file.name)
    const inference = await analyze(file)
    if (inference) onInferenceComplete({ tempMax:inference.tempMax, tempMin:inference.tempMin, pressure:inference.pressure, solarRad:inference.solarRad, uvIndex:inference.uvIndex, loc:inference.loc, friction:inference.friction, cohesion:inference.cohesion })
  }, [analyze, onInferenceComplete])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false)
    const file = e.dataTransfer.files[0]; if (file) processFile(file)
  }, [processFile])

  const bc = isDragOver ? 'var(--color-cyan)' : status === 'success' ? 'var(--color-green)' : status === 'error' ? '#ff4444' : 'var(--color-border)'

  return (
    <div className="font-mono" style={{ background:'var(--color-panel)', border:'1px solid var(--color-border)', borderTop:'2px solid #7c3aed' }}>
      <div className="px-3 py-2 tracking-widest text-xs font-bold" style={{ color:'#a78bfa', borderBottom:'1px solid var(--color-border)' }}>◈ NASA-IBM VISION MODEL</div>
      <div className="p-3">
        <div className="flex flex-col items-center justify-center cursor-pointer rounded"
          style={{ border:`2px dashed ${bc}`, padding:'18px 12px', background:isDragOver?'rgba(0,245,255,0.05)':'rgba(0,10,20,0.4)', transition:'all 0.2s', minHeight:'80px' }}
          onDragOver={e=>{e.preventDefault();setIsDragOver(true)}} onDragLeave={()=>setIsDragOver(false)}
          onDrop={handleDrop} onClick={()=>fileInputRef.current?.click()}>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)processFile(f)}}/>
          {status==='idle' && <><div style={{fontSize:'22px',marginBottom:'4px'}}>&#x1F6F8;</div><div style={{color:'var(--color-text-dim)',fontSize:'10px',textAlign:'center'}}>DROP IMAGE or click to select<br/><span style={{fontSize:'9px'}}>JPG · PNG · WEBP · max 10MB</span></div></>}
          {status==='uploading' && <><div style={{fontSize:'18px',marginBottom:'4px'}}>⚡</div><div style={{color:'#a78bfa',fontSize:'10px'}}>{fileName}</div><div style={{color:'#a78bfa',fontSize:'9px',marginTop:'4px'}}>NASA-IBM Lunar Foundation Model v1.0-mock<br/>~2 seconds...</div></>}
          {status==='success' && result && <><div style={{fontSize:'18px',marginBottom:'4px'}}>✅</div><div style={{color:'var(--color-green)',fontSize:'10px'}}>Inference complete — confidence: {Math.round(result.confidence*100)}%</div></>}
          {status==='error' && <><div style={{fontSize:'18px',marginBottom:'4px'}}>⚠️</div><div style={{color:'#ff6666',fontSize:'10px',textAlign:'center'}}>{error||'Upload failed'}</div></>}
        </div>
        {status==='success' && result && (
          <div className="mt-2 p-2 rounded" style={{background:'rgba(0,255,136,0.05)',border:'1px solid rgba(0,255,136,0.2)',fontSize:'9px'}}>
            <div style={{color:'var(--color-green)',marginBottom:'4px',letterSpacing:'0.1em'}}>▼ INFERRED PARAMETERS — Search auto-populated ↑</div>
            <div className="grid grid-cols-2 gap-x-3" style={{color:'var(--color-text-dim)'}}>
              <span>TempMAX</span><span style={{color:'var(--color-text)'}}>{result.tempMax}°C</span>
              <span>TempMIN</span><span style={{color:'var(--color-text)'}}>{result.tempMin}°C</span>
              <span>Pressure</span><span style={{color:'var(--color-text)'}}>{result.pressure} hPa</span>
              <span>Model</span><span style={{color:'#a78bfa',fontSize:'8px'}}>{result.model.slice(0,20)}...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
