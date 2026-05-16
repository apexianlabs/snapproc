import Link from 'next/link'
export default function SupportPage() {
  return (
    <div style={{minHeight:'100vh',fontFamily:'Inter,sans-serif',background:'#fff'}}>
      <nav style={{borderBottom:'1px solid #e2e8f0',padding:'16px 24px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <Link href="/" style={{fontWeight:800,fontSize:16,color:'#0f172a',textDecoration:'none'}}>Snapproc</Link>
        <Link href="/" style={{fontSize:13,color:'#64748b',textDecoration:'none'}}>← Back</Link>
      </nav>
      <div style={{maxWidth:680,margin:'0 auto',padding:'48px 24px'}}>
        <h1 style={{fontSize:28,fontWeight:800,color:'#0f172a',marginBottom:8}}>Support</h1>
        <p style={{fontSize:15,color:'#64748b',marginBottom:32}}>We're here to help. Reach out and we'll get back to you within 24 hours.</p>
        {[
          { q:'How do I generate an SOP?', a:'Go to the Generate page, enter your process name, select your department, and paste your rough steps. Click Generate SOP and your professional SOP will be ready in seconds.' },
          { q:'Can I download my SOPs?', a:'Yes — after generating, you can download as a text file. DOCX export is available on paid plans.' },
          { q:'How many SOPs can I generate for free?', a:'The free plan includes 3 SOPs per month. Upgrade to Starter for 50/month or Pro for unlimited.' },
          { q:'How do I cancel my subscription?', a:'Go to Billing in your dashboard and click Cancel subscription. You keep access until the end of your billing period.' },
          { q:'My SOP steps are empty — what do I do?', a:'Make sure your raw steps are detailed enough for the AI to work with. Each step should describe a clear action.' },
        ].map(s => (
          <div key={s.q} style={{marginBottom:24,background:'#f8fafc',borderRadius:10,padding:20,border:'1px solid #e2e8f0'}}>
            <h2 style={{fontSize:14,fontWeight:700,color:'#0f172a',marginBottom:8}}>{s.q}</h2>
            <p style={{fontSize:13,color:'#475569',lineHeight:1.6}}>{s.a}</p>
          </div>
        ))}
        <div style={{background:'#f0f9ff',borderRadius:12,padding:24,marginTop:16,border:'1px solid #bae6fd'}}>
          <h2 style={{fontSize:15,fontWeight:700,color:'#0891b2',marginBottom:8}}>Still need help?</h2>
          <p style={{fontSize:13,color:'#475569',marginBottom:12}}>Email us at <strong>support@snapproc.com</strong> and we'll respond within 24 hours.</p>
        </div>
      </div>
    </div>
  )
}
