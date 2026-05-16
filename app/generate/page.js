'use client'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'

const DEPARTMENTS = ['Operations','HR','Finance','IT','Marketing','Sales','Customer Support','Legal','Product','Other']

function SnaprocInner() {
  const [user, setUser]         = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [result, setResult]     = useState(null)
  const [form, setForm]         = useState({ process_name: '', department: 'Operations', raw_steps: '' })

  useEffect(() => {
    const match = document.cookie.match(/sp_user=([^;]+)/)
    if (match) { try { setUser(JSON.parse(decodeURIComponent(match[1]))) } catch(e) {} }
  }, [])

  const handleSubmit = async () => {
    if (!form.process_name.trim()) return setError('Please enter the process name.')
    if (!form.raw_steps.trim()) return setError('Please enter the process steps.')
    setLoading(true); setError(''); setResult(null)
    try {
      const token = document.cookie.match(/sp_token=([^;]+)/)?.[1] || ''
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...form, userId: user?.id })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setResult(data.result)
    } catch(e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const downloadDocx = async () => {
    if (!result) return
    try {
      const text = formatSopAsText(result, form.process_name, form.department)
      const blob = new Blob([text], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${form.process_name.replace(/\s+/g,'-').toLowerCase()}-sop.txt`
      a.click()
      URL.revokeObjectURL(url)
    } catch(e) { alert('Download failed') }
  }

  const formatSopAsText = (sop, name, dept) => {
    let text = `STANDARD OPERATING PROCEDURE\n${'='.repeat(50)}\n\n`
    text += `Process: ${name}\nDepartment: ${dept}\nDate: ${new Date().toLocaleDateString()}\n\n`
    if (sop.purpose) text += `PURPOSE\n${sop.purpose}\n\n`
    if (sop.scope) text += `SCOPE\n${sop.scope}\n\n`
    if (sop.steps) {
      text += `PROCEDURE\n`
      const steps = Array.isArray(sop.steps) ? sop.steps : Object.entries(sop.steps).map(([k,v]) => `${k}: ${v}`)
      steps.forEach((step, i) => {
        text += `\nStep ${i+1}: ${typeof step === 'string' ? step : step.title || step.step || JSON.stringify(step)}\n`
        if (step.description) text += `  ${step.description}\n`
      })
    }
    if (sop.notes || sop.warnings) text += `\nNOTES\n${sop.notes || sop.warnings}\n`
    return text
  }

  const inputStyle = { width:'100%',padding:'11px 14px',border:'1px solid #e2e8f0',borderRadius:10,fontSize:14,color:'#0f172a',background:'#fff',outline:'none',fontFamily:'Inter,sans-serif',boxSizing:'border-box' }
  const labelStyle = { fontSize:11,fontWeight:600,color:'#475569',textTransform:'uppercase',letterSpacing:'0.05em',display:'block',marginBottom:6 }

  return (
    <div style={{minHeight:'100vh',background:'#f8fafc',fontFamily:'Inter,sans-serif'}}>
      <nav style={{background:'#fff',borderBottom:'1px solid #e2e8f0',height:56,display:'flex',alignItems:'center',padding:'0 24px',gap:16,position:'sticky',top:0,zIndex:10}}>
        <Link href="/" style={{display:'flex',alignItems:'center',gap:8,textDecoration:'none'}}>
          <div style={{width:28,height:28,borderRadius:7,background:'#0891b2',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800,color:'#fff'}}>S</div>
          <span style={{fontWeight:700,color:'#0f172a',fontSize:15}}>Snapproc</span>
        </Link>
        <div style={{flex:1}}/>
        {user ? <Link href="/dashboard" style={{fontSize:13,color:'#64748b',textDecoration:'none'}}>Dashboard</Link>
               : <Link href="/login" style={{fontSize:13,color:'#0891b2',fontWeight:600,textDecoration:'none'}}>Sign in</Link>}
      </nav>

      <div style={{maxWidth:720,margin:'0 auto',padding:'40px 24px'}}>
        <div style={{marginBottom:28}}>
          <h1 style={{fontSize:26,fontWeight:800,color:'#0f172a',marginBottom:6}}>Generate an SOP</h1>
          <p style={{fontSize:14,color:'#64748b'}}>Paste your rough process steps and get a professional Standard Operating Procedure in seconds.</p>
        </div>

        {error && <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:10,padding:'12px 16px',fontSize:13,color:'#dc2626',marginBottom:20}}>{error}</div>}

        {result ? (
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:14,padding:20}}>
              <p style={{fontSize:11,fontWeight:700,color:'#15803d',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:4}}>✅ SOP Generated</p>
              <p style={{fontSize:20,fontWeight:800,color:'#0f172a'}}>{form.process_name}</p>
              <p style={{fontSize:13,color:'#64748b'}}>{form.department}</p>
            </div>

            {result.purpose && (
              <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,padding:20}}>
                <p style={{fontSize:11,fontWeight:700,color:'#475569',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:8}}>📋 Purpose</p>
                <p style={{fontSize:14,color:'#374151',lineHeight:1.7}}>{result.purpose}</p>
              </div>
            )}

            {result.scope && (
              <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,padding:20}}>
                <p style={{fontSize:11,fontWeight:700,color:'#475569',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:8}}>🎯 Scope</p>
                <p style={{fontSize:14,color:'#374151',lineHeight:1.7}}>{result.scope}</p>
              </div>
            )}

            {result.steps && (
              <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,padding:20}}>
                <p style={{fontSize:11,fontWeight:700,color:'#475569',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:12}}>📝 Procedure Steps</p>
                {(Array.isArray(result.steps) ? result.steps : Object.values(result.steps)).map((step, i) => (
                  <div key={i} style={{display:'flex',gap:12,marginBottom:16,paddingBottom:16,borderBottom: i < (Array.isArray(result.steps) ? result.steps : Object.values(result.steps)).length-1 ? '1px solid #f1f5f9' : 'none'}}>
                    <div style={{width:28,height:28,borderRadius:'50%',background:'#e0f2fe',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'#0891b2',flexShrink:0,marginTop:2}}>
                      {step.step_number || step.number || i+1}
                    </div>
                    <div style={{flex:1}}>
                      {typeof step === 'string' ? (
                        <p style={{fontSize:14,color:'#0f172a',lineHeight:1.6}}>{step}</p>
                      ) : (
                        <>
                          {(step.title || step.step || step.action) && (
                            <p style={{fontSize:14,fontWeight:700,color:'#0f172a',marginBottom:6}}>
                              {step.title || step.step || step.action}
                            </p>
                          )}
                          {step.description && <p style={{fontSize:13,color:'#374151',lineHeight:1.7,marginBottom:6}}>{step.description}</p>}
                          {step.tool && step.tool !== 'To be specified based on actual workflow tooling' && (
                            <p style={{fontSize:11,color:'#0891b2',fontWeight:600,marginBottom:4}}>🔧 {step.tool}</p>
                          )}
                          {step.responsible_party && <p style={{fontSize:11,color:'#0891b2',fontWeight:600,marginBottom:4}}>👤 {step.responsible_party}</p>}
                          {step.note && step.note !== 'Confirm all required inputs or data are available before beginning this step.' && (
                            <div style={{background:'#f0f9ff',borderRadius:6,padding:'8px 10px',marginTop:6}}>
                              <p style={{fontSize:12,color:'#0369a1',lineHeight:1.5}}>💡 {step.note}</p>
                            </div>
                          )}
                          {step.conditional && (
                            <div style={{background:'#fffbeb',borderRadius:6,padding:'8px 10px',marginTop:6}}>
                              <p style={{fontSize:12,color:'#d97706',lineHeight:1.5}}>⚡ {step.conditional}</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(result.notes || result.warnings) && (
              <div style={{background:'#fffbeb',border:'1px solid #fde68a',borderRadius:12,padding:20}}>
                <p style={{fontSize:11,fontWeight:700,color:'#d97706',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:8}}>⚠️ Notes & Warnings</p>
                <p style={{fontSize:14,color:'#374151',lineHeight:1.7}}>{result.notes || result.warnings}</p>
              </div>
            )}

            <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
              <button onClick={downloadDocx}
                style={{flex:1,minWidth:140,padding:'11px',borderRadius:10,border:'1px solid #bae6fd',background:'#f0f9ff',fontSize:13,fontWeight:600,color:'#0891b2',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                📄 Download SOP
              </button>
              <button onClick={() => { setResult(null); setForm({ process_name:'', department:'Operations', raw_steps:'' }) }}
                style={{flex:1,minWidth:140,padding:'11px',borderRadius:10,border:'1px solid #e2e8f0',background:'#fff',fontSize:13,fontWeight:600,color:'#475569',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                Generate another
              </button>
              {!user && (
                <Link href="/signup" style={{flex:2,minWidth:200,padding:'11px',borderRadius:10,border:'none',background:'#0891b2',color:'#fff',fontSize:13,fontWeight:700,textDecoration:'none',textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  Save to library →
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:14,padding:28}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:18}}>
              <div>
                <label style={labelStyle}>Process name *</label>
                <input value={form.process_name} onChange={e => setForm({...form,process_name:e.target.value})}
                  placeholder="e.g. Employee Onboarding" style={inputStyle}/>
              </div>
              <div>
                <label style={labelStyle}>Department</label>
                <select value={form.department} onChange={e => setForm({...form,department:e.target.value})} style={{...inputStyle,background:'#fff'}}>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div style={{marginBottom:24}}>
              <label style={labelStyle}>Raw process steps *</label>
              <textarea value={form.raw_steps} onChange={e => setForm({...form,raw_steps:e.target.value})}
                placeholder="Dump your rough steps here — bullet points, numbered list, or just a brain dump. e.g.&#10;- new hire fills out form&#10;- IT sets up laptop&#10;- manager intro meeting&#10;- first week checklist..."
                rows={8} style={{...inputStyle,resize:'vertical'}}/>
            </div>
            <button onClick={handleSubmit} disabled={loading}
              style={{width:'100%',padding:'13px',borderRadius:10,border:'none',background:loading?'#67e8f9':'#0891b2',color:'#fff',fontSize:15,fontWeight:700,cursor:loading?'not-allowed':'pointer',fontFamily:'Inter,sans-serif'}}>
              {loading ? '⚙️ Generating SOP...' : 'Generate SOP →'}
            </button>
            {!user && <p style={{textAlign:'center',fontSize:12,color:'#94a3b8',marginTop:12}}>
              <Link href="/signup" style={{color:'#0891b2',textDecoration:'none',fontWeight:600}}>Sign up free</Link> to save SOPs and build your process library.
            </p>}
          </div>
        )}
      </div>
    </div>
  )
}

export default function GeneratePage() {
  return (
    <Suspense fallback={<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',color:'#94a3b8'}}>Loading...</div>}>
      <SnaprocInner />
    </Suspense>
  )
}
