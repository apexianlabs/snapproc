'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const DEPARTMENTS = ['Operations','HR','Finance','IT','Marketing','Sales','Customer Support','Legal','Product','Other']

const printStyles = `@media print { nav, .no-print { display: none !important; } body { background: white; } }`

export default function GeneratePage() {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [result, setResult]   = useState(null)
  const [form, setForm]       = useState({ process_name: '', department: 'Operations', raw_steps: '' })

  useEffect(() => {
    try {
      const match = document.cookie.match(/sp_user=([^;]+)/)
      if (match) setUser(JSON.parse(decodeURIComponent(match[1])))
    } catch(e) {}
  }, [])

  const downloadTxt = () => {
    if (!result) return
    let text = `STANDARD OPERATING PROCEDURE\n${'='.repeat(50)}\n\n`
    text += `Process: ${result.sop_title || form.process_name}\nDepartment: ${form.department}\nDate: ${new Date().toLocaleDateString()}\n\n`
    if (result.purpose) text += `PURPOSE\n${result.purpose}\n\n`
    if (result.scope) text += `SCOPE\n${result.scope}\n\n`
    if (result.steps?.length) {
      text += `PROCEDURE\n`
      result.steps.forEach((step, i) => {
        text += `\nStep ${step.number || i+1}: ${step.action || step.title || ''}\n`
        if (step.tool) text += `  Tool: ${step.tool}\n`
        if (step.note) text += `  Note: ${step.note}\n`
        if (step.conditional && step.conditional !== 'null') text += `  If: ${step.conditional}\n`
      })
    }
    if (result.expected_outcome) text += `\nEXPECTED OUTCOME\n${result.expected_outcome}\n`
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(result.sop_title || form.process_name).replace(/\s+/g,'-').toLowerCase()}-sop.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadPdf = () => {
    if (!result) return
    window.print()
  }

  const handleSubmit = async () => {
    if (!form.process_name.trim()) return setError('Please enter the process name.')
    if (!form.raw_steps.trim()) return setError('Please enter the process steps.')
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const token = document.cookie.match(/sp_token=([^;]+)/)?.[1] || ''
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...form, userId: user?.id })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setResult(data.result)
    } catch(e) {
      setError(e.message)
    }
    setLoading(false)
  }

  if (result) {
    const steps = result.steps || []
    return (
      <div style={{minHeight:'100vh',background:'#f8fafc',fontFamily:'Inter,sans-serif'}}>
        <nav style={{background:'#fff',borderBottom:'1px solid #e2e8f0',height:56,display:'flex',alignItems:'center',padding:'0 24px',gap:16}}>
          <Link href="/" style={{display:'flex',alignItems:'center',gap:8,textDecoration:'none'}}>
            <div style={{width:28,height:28,borderRadius:7,background:'#0891b2',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800,color:'#fff'}}>S</div>
            <span style={{fontWeight:700,color:'#0f172a',fontSize:15}}>Snapproc</span>
          </Link>
          <div style={{flex:1}}/>
          <button onClick={() => setResult(null)} style={{fontSize:13,color:'#64748b',background:'none',border:'none',cursor:'pointer'}}>← New SOP</button>
        </nav>
        <div style={{maxWidth:720,margin:'0 auto',padding:'32px 24px'}}>
          <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:12,padding:20,marginBottom:16}}>
            <p style={{fontSize:11,fontWeight:700,color:'#15803d',textTransform:'uppercase',marginBottom:4}}>✅ SOP Generated</p>
            <p style={{fontSize:20,fontWeight:800,color:'#0f172a'}}>{result.sop_title || form.process_name}</p>
            <p style={{fontSize:13,color:'#64748b'}}>{form.department}</p>
          </div>

          {result.purpose && (
            <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,padding:20,marginBottom:12}}>
              <p style={{fontSize:11,fontWeight:700,color:'#475569',textTransform:'uppercase',marginBottom:8}}>📋 Purpose</p>
              <p style={{fontSize:14,color:'#374151',lineHeight:1.7}}>{result.purpose}</p>
            </div>
          )}

          {result.scope && (
            <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,padding:20,marginBottom:12}}>
              <p style={{fontSize:11,fontWeight:700,color:'#475569',textTransform:'uppercase',marginBottom:8}}>🎯 Scope</p>
              <p style={{fontSize:14,color:'#374151',lineHeight:1.7}}>{result.scope}</p>
            </div>
          )}

          {steps.length > 0 && (
            <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,padding:20,marginBottom:12}}>
              <p style={{fontSize:11,fontWeight:700,color:'#475569',textTransform:'uppercase',marginBottom:16}}>📝 Procedure Steps</p>
              {steps.map((step, i) => (
                <div key={i} style={{display:'flex',gap:12,marginBottom:16,paddingBottom:16,borderBottom: i < steps.length-1 ? '1px solid #f1f5f9' : 'none'}}>
                  <div style={{width:28,height:28,borderRadius:'50%',background:'#e0f2fe',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'#0891b2',flexShrink:0,marginTop:2}}>
                    {step.number || i+1}
                  </div>
                  <div style={{flex:1}}>
                    <p style={{fontSize:14,color:'#0f172a',lineHeight:1.7,marginBottom:4}}>
                      {step.action || step.title || step.description || JSON.stringify(step)}
                    </p>
                    {step.tool && step.tool !== 'To be specified based on actual workflow tooling' && (
                      <p style={{fontSize:11,color:'#0891b2',fontWeight:600,marginBottom:4}}>🔧 {step.tool}</p>
                    )}
                    {step.note && (
                      <div style={{background:'#f0f9ff',borderRadius:6,padding:'6px 10px',marginTop:4}}>
                        <p style={{fontSize:12,color:'#0369a1'}}>💡 {step.note}</p>
                      </div>
                    )}
                    {step.conditional && step.conditional !== 'null' && step.conditional !== null && (
                      <div style={{background:'#fffbeb',borderRadius:6,padding:'6px 10px',marginTop:4}}>
                        <p style={{fontSize:12,color:'#d97706'}}>⚡ {step.conditional}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {result.expected_outcome && (
            <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:12,padding:20,marginBottom:12}}>
              <p style={{fontSize:11,fontWeight:700,color:'#15803d',textTransform:'uppercase',marginBottom:8}}>🎯 Expected Outcome</p>
              <p style={{fontSize:14,color:'#374151',lineHeight:1.7}}>{result.expected_outcome}</p>
            </div>
          )}

          <div style={{display:'flex',gap:12}}>
            <button onClick={downloadTxt}
              style={{flex:1,minWidth:120,padding:'11px',borderRadius:10,border:'1px solid #bae6fd',background:'#f0f9ff',fontSize:13,fontWeight:600,color:'#0891b2',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
              📄 Download TXT
            </button>
            <button onClick={downloadPdf}
              style={{flex:1,minWidth:120,padding:'11px',borderRadius:10,border:'1px solid #fecaca',background:'#fef2f2',fontSize:13,fontWeight:600,color:'#dc2626',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
              📕 Print / PDF
            </button>
            <button onClick={() => setResult(null)}
              style={{flex:1,minWidth:120,padding:'11px',borderRadius:10,border:'1px solid #e2e8f0',background:'#fff',fontSize:13,fontWeight:600,color:'#475569',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
              New SOP
            </button>
            {!user && (
              <Link href="/login" style={{flex:2,minWidth:140,padding:'11px',borderRadius:10,border:'none',background:'#0891b2',color:'#fff',fontSize:13,fontWeight:700,textDecoration:'none',textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center'}}>
                Save to library →
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{minHeight:'100vh',background:'#f8fafc',fontFamily:'Inter,sans-serif'}}>
      <nav style={{background:'#fff',borderBottom:'1px solid #e2e8f0',height:56,display:'flex',alignItems:'center',padding:'0 24px',gap:16}}>
        <Link href="/" style={{display:'flex',alignItems:'center',gap:8,textDecoration:'none'}}>
          <div style={{width:28,height:28,borderRadius:7,background:'#0891b2',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800,color:'#fff'}}>S</div>
          <span style={{fontWeight:700,color:'#0f172a',fontSize:15}}>Snapproc</span>
        </Link>
        <div style={{flex:1}}/>
        {user ? <Link href="/dashboard" style={{fontSize:13,color:'#64748b',textDecoration:'none'}}>Dashboard</Link>
               : <Link href="/login" style={{fontSize:13,color:'#0891b2',fontWeight:600,textDecoration:'none'}}>Sign in</Link>}
      </nav>
      <div style={{maxWidth:720,margin:'0 auto',padding:'40px 24px'}}>
        <h1 style={{fontSize:26,fontWeight:800,color:'#0f172a',marginBottom:6}}>Generate an SOP</h1>
        <p style={{fontSize:14,color:'#64748b',marginBottom:28}}>Paste your rough process steps and get a professional SOP in seconds.</p>
        {error && <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:10,padding:'12px 16px',fontSize:13,color:'#dc2626',marginBottom:20}}>{error}</div>}
        <pre id="debug-out" style={{background:'#000',color:'#0f0',padding:12,borderRadius:8,fontSize:11,marginBottom:16,minHeight:20}}></pre>
        <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:14,padding:28}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:18}}>
            <div>
              <label style={{fontSize:11,fontWeight:600,color:'#475569',textTransform:'uppercase',letterSpacing:'0.05em',display:'block',marginBottom:6}}>Process name *</label>
              <input value={form.process_name} onChange={e => setForm({...form,process_name:e.target.value})}
                placeholder="e.g. Employee Onboarding"
                style={{width:'100%',padding:'11px 14px',border:'1px solid #e2e8f0',borderRadius:10,fontSize:14,color:'#0f172a',outline:'none',fontFamily:'Inter,sans-serif',boxSizing:'border-box'}}/>
            </div>
            <div>
              <label style={{fontSize:11,fontWeight:600,color:'#475569',textTransform:'uppercase',letterSpacing:'0.05em',display:'block',marginBottom:6}}>Department</label>
              <select value={form.department} onChange={e => setForm({...form,department:e.target.value})}
                style={{width:'100%',padding:'11px 14px',border:'1px solid #e2e8f0',borderRadius:10,fontSize:14,color:'#0f172a',outline:'none',fontFamily:'Inter,sans-serif',background:'#fff',boxSizing:'border-box'}}>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div style={{marginBottom:24}}>
            <label style={{fontSize:11,fontWeight:600,color:'#475569',textTransform:'uppercase',letterSpacing:'0.05em',display:'block',marginBottom:6}}>Raw process steps *</label>
            <textarea value={form.raw_steps} onChange={e => setForm({...form,raw_steps:e.target.value})}
              placeholder="Dump your rough steps here..."
              rows={8}
              style={{width:'100%',padding:'11px 14px',border:'1px solid #e2e8f0',borderRadius:10,fontSize:14,color:'#0f172a',outline:'none',fontFamily:'Inter,sans-serif',resize:'vertical',boxSizing:'border-box'}}/>
          </div>
          <button onClick={handleSubmit} disabled={loading}
            style={{width:'100%',padding:'13px',borderRadius:10,border:'none',background:loading?'#67e8f9':'#0891b2',color:'#fff',fontSize:15,fontWeight:700,cursor:loading?'not-allowed':'pointer',fontFamily:'Inter,sans-serif'}}>
            {loading ? '⚙️ Generating SOP...' : 'Generate SOP →'}
          </button>
        </div>
      </div>
    </div>
  )
}
