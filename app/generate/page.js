'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function GeneratePage() {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [result, setResult]   = useState(null)
  const [form, setForm]       = useState({ business_name: '', reviews: '', time_period: 'Last 30 days' })

  useEffect(() => {
    try {
      const match = document.cookie.match(/hex_user=([^;]+)/)
      if (match) setUser(JSON.parse(decodeURIComponent(match[1])))
    } catch(e) {}
  }, [])

  const handleSubmit = async () => {
    if (!form.business_name.trim()) return setError('Please enter your business name.')
    if (!form.reviews.trim()) return setError('Please paste your reviews.')
    setLoading(true); setError(''); setResult(null)
    try {
      const token = document.cookie.match(/hex_token=([^;]+)/)?.[1] || ''
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...form, userId: user?.id })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setResult(data.result)
    } catch(e) { setError(e.message) }
    setLoading(false)
  }

  const inputStyle = { width:'100%', padding:'11px 14px', border:'1px solid #e2e8f0', borderRadius:10, fontSize:14, color:'#0f172a', background:'#fff', outline:'none', fontFamily:'Inter,sans-serif', boxSizing:'border-box' }
  const labelStyle = { fontSize:11, fontWeight:600, color:'#475569', textTransform:'uppercase', letterSpacing:'0.05em', display:'block', marginBottom:6 }

  if (result) return (
    <div style={{minHeight:'100vh',background:'#f8fafc',fontFamily:'Inter,sans-serif'}}>
      <nav style={{background:'#fff',borderBottom:'1px solid #e2e8f0',height:56,display:'flex',alignItems:'center',padding:'0 24px',gap:16}}>
        <Link href="/" style={{display:'flex',alignItems:'center',gap:8,textDecoration:'none'}}>
          <div style={{width:28,height:28,borderRadius:7,background:'#dc2626',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800,color:'#fff'}}>H</div>
          <span style={{fontWeight:700,color:'#0f172a',fontSize:15}}>HexorIQ</span>
        </Link>
        <div style={{flex:1}}/>
        {user ? <Link href="/dashboard" style={{fontSize:13,color:'#64748b',textDecoration:'none'}}>Dashboard</Link>
               : <Link href="/login" style={{fontSize:13,color:'#dc2626',fontWeight:600,textDecoration:'none'}}>Sign in</Link>}
      </nav>
      <div style={{maxWidth:760,margin:'0 auto',padding:'32px 24px',display:'flex',flexDirection:'column',gap:14}}>
        <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:12,padding:20}}>
          <p style={{fontSize:11,fontWeight:700,color:'#dc2626',textTransform:'uppercase',marginBottom:4}}>✅ Review Analysis Complete</p>
          <p style={{fontSize:20,fontWeight:800,color:'#0f172a'}}>{form.business_name}</p>
          <p style={{fontSize:13,color:'#64748b'}}>{form.time_period}</p>
        </div>
        {result.summary && <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,padding:20}}>
          <p style={{fontSize:11,fontWeight:700,color:'#475569',textTransform:'uppercase',marginBottom:8}}>📊 Summary</p>
          <p style={{fontSize:14,color:'#374151',lineHeight:1.7}}>{result.summary}</p>
        </div>}
        {result.sentiment && <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,padding:20}}>
          <p style={{fontSize:11,fontWeight:700,color:'#475569',textTransform:'uppercase',marginBottom:8}}>😊 Sentiment</p>
          <p style={{fontSize:14,color:'#374151',lineHeight:1.7}}>{typeof result.sentiment === 'string' ? result.sentiment : JSON.stringify(result.sentiment)}</p>
        </div>}
        {result.themes && <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,padding:20}}>
          <p style={{fontSize:11,fontWeight:700,color:'#475569',textTransform:'uppercase',marginBottom:8}}>🔑 Key Themes</p>
          {Array.isArray(result.themes) ? result.themes.map((t,i) => (
            <div key={i} style={{display:'flex',gap:8,marginBottom:8,alignItems:'flex-start'}}>
              <span style={{color:'#dc2626',fontSize:12,marginTop:2}}>•</span>
              <p style={{fontSize:13,color:'#374151',lineHeight:1.6}}>{typeof t === 'string' ? t : t.theme || JSON.stringify(t)}</p>
            </div>
          )) : <p style={{fontSize:14,color:'#374151'}}>{result.themes}</p>}
        </div>}
        {result.action_points && <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:12,padding:20}}>
          <p style={{fontSize:11,fontWeight:700,color:'#dc2626',textTransform:'uppercase',marginBottom:8}}>🎯 Action Points</p>
          {Array.isArray(result.action_points) ? result.action_points.map((a,i) => (
            <div key={i} style={{display:'flex',gap:8,marginBottom:8,alignItems:'flex-start'}}>
              <span style={{color:'#dc2626',fontSize:12,marginTop:2,fontWeight:700}}>{i+1}.</span>
              <p style={{fontSize:13,color:'#374151',lineHeight:1.6}}>{typeof a === 'string' ? a : JSON.stringify(a)}</p>
            </div>
          )) : <p style={{fontSize:14,color:'#374151'}}>{result.action_points}</p>}
        </div>}
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          <button onClick={() => window.print()} style={{flex:1,minWidth:120,padding:'10px',borderRadius:8,border:'1px solid #fecaca',background:'#fef2f2',fontSize:13,fontWeight:600,color:'#dc2626',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>📕 Print / PDF</button>
          <button onClick={() => { setResult(null); setForm({ business_name:'', reviews:'', time_period:'Last 30 days' }) }} style={{flex:1,minWidth:120,padding:'10px',borderRadius:8,border:'1px solid #e2e8f0',background:'#fff',fontSize:13,fontWeight:600,color:'#475569',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>Analyse another</button>
          {user ? <Link href="/dashboard" style={{flex:1,minWidth:120,padding:'10px',borderRadius:8,border:'none',background:'#dc2626',color:'#fff',fontSize:13,fontWeight:700,textDecoration:'none',textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center'}}>View dashboard →</Link>
                : <Link href="/login" style={{flex:1,minWidth:120,padding:'10px',borderRadius:8,border:'none',background:'#dc2626',color:'#fff',fontSize:13,fontWeight:700,textDecoration:'none',textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center'}}>Save results →</Link>}
        </div>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#f8fafc',fontFamily:'Inter,sans-serif'}}>
      <nav style={{background:'#fff',borderBottom:'1px solid #e2e8f0',height:56,display:'flex',alignItems:'center',padding:'0 24px',gap:16}}>
        <Link href="/" style={{display:'flex',alignItems:'center',gap:8,textDecoration:'none'}}>
          <div style={{width:28,height:28,borderRadius:7,background:'#dc2626',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800,color:'#fff'}}>H</div>
          <span style={{fontWeight:700,color:'#0f172a',fontSize:15}}>HexorIQ</span>
        </Link>
        <div style={{flex:1}}/>
        {user ? <Link href="/dashboard" style={{fontSize:13,color:'#64748b',textDecoration:'none'}}>Dashboard</Link>
               : <Link href="/login" style={{fontSize:13,color:'#dc2626',fontWeight:600,textDecoration:'none'}}>Sign in</Link>}
      </nav>
      <div style={{maxWidth:680,margin:'0 auto',padding:'40px 24px'}}>
        <h1 style={{fontSize:26,fontWeight:800,color:'#0f172a',marginBottom:6}}>Analyse your reviews</h1>
        <p style={{fontSize:14,color:'#64748b',marginBottom:28}}>Paste your customer reviews and get an instant AI summary — themes, sentiment, and action points.</p>
        {error && <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:10,padding:'12px 16px',fontSize:13,color:'#dc2626',marginBottom:20}}>{error}</div>}
        <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:14,padding:28}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:18}}>
            <div>
              <label style={labelStyle}>Business name *</label>
              <input value={form.business_name} onChange={e => setForm({...form,business_name:e.target.value})} placeholder="e.g. Riverside Coffee Co" style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>Time period</label>
              <select value={form.time_period} onChange={e => setForm({...form,time_period:e.target.value})} style={{...inputStyle,background:'#fff'}}>
                {['Last 7 days','Last 30 days','Last 90 days','Last 6 months','Last year','All time'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div style={{marginBottom:24}}>
            <label style={labelStyle}>Customer reviews *</label>
            <textarea value={form.reviews} onChange={e => setForm({...form,reviews:e.target.value})}
              placeholder="Paste your Google, Trustpilot, Yelp or other reviews here. Each review on a new line works best..."
              rows={10} style={{...inputStyle,resize:'vertical'}}/>
          </div>
          <button onClick={handleSubmit} disabled={loading}
            style={{width:'100%',padding:'13px',borderRadius:10,border:'none',background:loading?'#fca5a5':'#dc2626',color:'#fff',fontSize:15,fontWeight:700,cursor:loading?'not-allowed':'pointer',fontFamily:'Inter,sans-serif'}}>
            {loading ? '🔍 Analysing reviews...' : 'Analyse reviews →'}
          </button>
            <div style={{marginTop:16,background:'#fef9f0',border:'1px solid #fed7aa',borderRadius:8,padding:'12px 16px',display:'flex',gap:10,alignItems:'flex-start'}}>
            <span style={{fontSize:16,flexShrink:0}}>🔔</span>
            <div>
              <p style={{fontSize:12,fontWeight:700,color:'#d97706',marginBottom:2}}>Automated weekly digests coming soon</p>
              <p style={{fontSize:12,color:'#92400e',lineHeight:1.5}}>Connect your Google, Trustpilot, or App Store reviews and HexorIQ will automatically monitor and email you a weekly AI digest. <Link href="/signup" style={{color:'#d97706',fontWeight:600,textDecoration:'none'}}>Sign up</Link> to get early access.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
