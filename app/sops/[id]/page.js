'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function SopDetailPage() {
  const router = useRouter()
  const { id } = useParams()
  const [sop, setSop]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  useEffect(() => {
    const token = document.cookie.match(/sp_token=([^;]+)/)?.[1]
    if (!token) { router.push('/login'); return }
    fetch(`/api/sops/${id}`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data.error) setError('SOP not found')
        else setSop(data.sop)
      })
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false))
  }, [id])

  const downloadDocx = async () => {
    if (!sop?.sop_data) return
    try {
      const token = document.cookie.match(/sp_token=([^;]+)/)?.[1] || ''
      const res = await fetch('/api/download-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ result: sop.sop_data, process_name: sop.process_name, department: sop.department })
      })
      const data = await res.json()
      if (!data.docx) return
      const blob = new Blob([Uint8Array.from(atob(data.docx), c => c.charCodeAt(0))], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${(sop.process_name||'sop').replace(/\s+/g,'-').toLowerCase()}-sop.docx`
      a.click()
      URL.revokeObjectURL(url)
    } catch(e) {}
  }

  if (loading) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Inter,sans-serif',color:'#94a3b8'}}>Loading...</div>
  if (error) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Inter,sans-serif'}}>
      <div style={{textAlign:'center'}}>
        <p style={{color:'#dc2626',marginBottom:16}}>{error}</p>
        <Link href="/dashboard" style={{color:'#0891b2',textDecoration:'none'}}>← Back to dashboard</Link>
      </div>
    </div>
  )

  const result = sop?.sop_data || {}
  const steps = result.steps || []

  return (
    <div style={{minHeight:'100vh',background:'#f8fafc',fontFamily:'Inter,sans-serif'}}>
      <nav style={{background:'#fff',borderBottom:'1px solid #e2e8f0',height:56,display:'flex',alignItems:'center',padding:'0 24px',gap:16,position:'sticky',top:0,zIndex:10}}>
        <Link href="/dashboard" style={{fontSize:13,color:'#64748b',textDecoration:'none'}}>← Dashboard</Link>
        <div style={{flex:1}}/>
        <button onClick={downloadDocx}
          style={{background:'#0891b2',color:'#fff',padding:'7px 16px',borderRadius:8,border:'none',fontSize:13,fontWeight:600,cursor:'pointer'}}>
          📄 Download DOCX
        </button>
        <button onClick={() => window.print()}
          style={{background:'#dc2626',color:'#fff',padding:'7px 16px',borderRadius:8,border:'none',fontSize:13,fontWeight:600,cursor:'pointer'}}>
          📕 PDF
        </button>
      </nav>
      <div style={{maxWidth:720,margin:'0 auto',padding:'32px 24px'}}>
        <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:12,padding:20,marginBottom:16}}>
          <p style={{fontSize:11,fontWeight:700,color:'#15803d',textTransform:'uppercase',marginBottom:4}}>SOP</p>
          <p style={{fontSize:20,fontWeight:800,color:'#0f172a'}}>{result.sop_title || sop?.process_name}</p>
          <p style={{fontSize:13,color:'#64748b'}}>{sop?.department} · {new Date(sop?.created_at).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</p>
        </div>
        {result.purpose && <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,padding:20,marginBottom:12}}>
          <p style={{fontSize:11,fontWeight:700,color:'#475569',textTransform:'uppercase',marginBottom:8}}>📋 Purpose</p>
          <p style={{fontSize:14,color:'#374151',lineHeight:1.7}}>{result.purpose}</p>
        </div>}
        {result.scope && <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,padding:20,marginBottom:12}}>
          <p style={{fontSize:11,fontWeight:700,color:'#475569',textTransform:'uppercase',marginBottom:8}}>🎯 Scope</p>
          <p style={{fontSize:14,color:'#374151',lineHeight:1.7}}>{result.scope}</p>
        </div>}
        {steps.length > 0 && (
          <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,padding:20,marginBottom:12}}>
            <p style={{fontSize:11,fontWeight:700,color:'#475569',textTransform:'uppercase',marginBottom:16}}>📝 Procedure Steps</p>
            {steps.map((step, i) => (
              <div key={i} style={{display:'flex',gap:12,marginBottom:16,paddingBottom:16,borderBottom: i < steps.length-1 ? '1px solid #f1f5f9' : 'none'}}>
                <div style={{width:28,height:28,borderRadius:'50%',background:'#e0f2fe',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'#0891b2',flexShrink:0,marginTop:2}}>
                  {step.number || i+1}
                </div>
                <div style={{flex:1}}>
                  <p style={{fontSize:14,fontWeight:600,color:'#0f172a',marginBottom:4}}>{step.action || step.title}</p>
                  {step.tool && step.tool !== 'To be specified based on actual workflow tooling' && <p style={{fontSize:12,color:'#0891b2',marginBottom:4}}>🔧 {step.tool}</p>}
                  {step.note && <div style={{background:'#f0f9ff',borderRadius:6,padding:'6px 10px',marginTop:4,marginBottom:4}}><p style={{fontSize:12,color:'#0369a1'}}>{step.note}</p></div>}
                  {step.conditional && step.conditional !== 'null' && <div style={{background:'#fffbeb',borderRadius:6,padding:'6px 10px',marginTop:4}}><p style={{fontSize:12,color:'#d97706'}}>⚡ {step.conditional}</p></div>}
                </div>
              </div>
            ))}
          </div>
        )}
        {result.expected_outcome && <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:12,padding:20,marginBottom:12}}>
          <p style={{fontSize:11,fontWeight:700,color:'#15803d',textTransform:'uppercase',marginBottom:8}}>🎯 Expected Outcome</p>
          <p style={{fontSize:14,color:'#374151',lineHeight:1.7}}>{result.expected_outcome}</p>
        </div>}
      </div>
    </div>
  )
}
