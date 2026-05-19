'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function GeneratePage() {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [result, setResult]   = useState(null)
  const [itemId, setItemId]   = useState(null)
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
      if (res.status === 402) {
        setError('limit_reached')
        setLoading(false)
        return
      }
      if (!res.ok) throw new Error(data.error || 'Failed')
      setResult(data.result)
      setItemId(data.itemId)
    } catch(e) { setError(e.message) }
    setLoading(false)
  }

  const enableAutoMonitor = async () => {
    try {
      const token = document.cookie.match(/hex_token=([^;]+)/)?.[1] || ''
      await fetch('/api/enable-monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ itemId, business_name: form.business_name })
      })
      alert('Weekly digest enabled! You\'ll receive an email every Monday with your review intelligence.')
    } catch(e) { alert('Failed to enable: ' + e.message) }
  }

  const inputStyle = { width:'100%', padding:'10px 12px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:14, color:'#0f172a', background:'#fff', outline:'none', fontFamily:'Inter,sans-serif', boxSizing:'border-box' }
  const labelStyle = { fontSize:11, fontWeight:600, color:'#475569', textTransform:'uppercase', letterSpacing:'0.05em', display:'block', marginBottom:5 }

  const getSentimentColor = (s) => {
    if (!s) return '#64748b'
    const v = s.toLowerCase()
    if (v.includes('positive') || v.includes('excellent')) return '#15803d'
    if (v.includes('negative') || v.includes('poor')) return '#dc2626'
    return '#d97706'
  }

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
        
        {/* Header */}
        <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:12,padding:20}}>
          <p style={{fontSize:11,fontWeight:700,color:'#dc2626',textTransform:'uppercase',marginBottom:4}}>✅ Analysis Complete</p>
          <p style={{fontSize:20,fontWeight:800,color:'#0f172a'}}>{form.business_name}</p>
          <p style={{fontSize:13,color:'#64748b'}}>{form.time_period}</p>
        </div>

        {/* Sentiment + Score */}
        {(result.overall_sentiment || result.sentiment_score) && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            {result.overall_sentiment && (
              <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,padding:18,textAlign:'center'}}>
                <p style={{fontSize:11,fontWeight:700,color:'#475569',textTransform:'uppercase',marginBottom:8}}>Overall Sentiment</p>
                <p style={{fontSize:22,fontWeight:800,color:getSentimentColor(result.overall_sentiment)}}>{result.overall_sentiment}</p>
              </div>
            )}
            {result.sentiment_score && (
              <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,padding:18,textAlign:'center'}}>
                <p style={{fontSize:11,fontWeight:700,color:'#475569',textTransform:'uppercase',marginBottom:8}}>Score</p>
                <p style={{fontSize:22,fontWeight:800,color:getSentimentColor(result.overall_sentiment)}}>{result.sentiment_score}/100</p>
              </div>
            )}
          </div>
        )}

        {/* Summary */}
        {result.summary && (
          <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,padding:20}}>
            <p style={{fontSize:11,fontWeight:700,color:'#475569',textTransform:'uppercase',marginBottom:8}}>📊 Summary</p>
            <p style={{fontSize:14,color:'#374151',lineHeight:1.7}}>{result.summary}</p>
          </div>
        )}

        {/* Top Themes */}
        {result.top_themes && result.top_themes.length > 0 && (
          <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,padding:20}}>
            <p style={{fontSize:11,fontWeight:700,color:'#475569',textTransform:'uppercase',marginBottom:12}}>🔑 Key Themes</p>
            <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
              {result.top_themes.map((t,i) => (
                <div key={i} style={{
                  background: t.sentiment === 'positive' ? '#f0fdf4' : t.sentiment === 'negative' ? '#fef2f2' : '#fffbeb',
                  border: `1px solid ${t.sentiment === 'positive' ? '#bbf7d0' : t.sentiment === 'negative' ? '#fecaca' : '#fde68a'}`,
                  borderRadius:8, padding:'6px 12px', fontSize:13,
                  color: t.sentiment === 'positive' ? '#15803d' : t.sentiment === 'negative' ? '#dc2626' : '#d97706',
                  fontWeight:600
                }}>
                  {typeof t === 'string' ? t : t.theme || JSON.stringify(t)}
                  {t.frequency && <span style={{fontSize:11,opacity:0.7,marginLeft:4}}>×{t.frequency}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Issues */}
        {result.key_issues && result.key_issues.length > 0 && (
          <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:12,padding:20}}>
            <p style={{fontSize:11,fontWeight:700,color:'#dc2626',textTransform:'uppercase',marginBottom:10}}>⚠️ Key Issues</p>
            {result.key_issues.map((issue,i) => (
              <div key={i} style={{display:'flex',gap:8,marginBottom:8}}>
                <span style={{color:'#dc2626',fontSize:12,marginTop:2,flexShrink:0}}>!</span>
                <p style={{fontSize:13,color:'#374151',lineHeight:1.6}}>{typeof issue === 'string' ? issue : JSON.stringify(issue)}</p>
              </div>
            ))}
          </div>
        )}

        {/* Actionable Insights */}
        {result.actionable_insights && result.actionable_insights.length > 0 && (
          <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:12,padding:20}}>
            <p style={{fontSize:11,fontWeight:700,color:'#15803d',textTransform:'uppercase',marginBottom:10}}>🎯 Action Points</p>
            {result.actionable_insights.map((action,i) => (
              <div key={i} style={{display:'flex',gap:8,marginBottom:10}}>
                <span style={{color:'#15803d',fontSize:12,marginTop:2,fontWeight:700,flexShrink:0}}>{i+1}.</span>
                <p style={{fontSize:13,color:'#374151',lineHeight:1.6}}>{typeof action === 'string' ? action : JSON.stringify(action)}</p>
              </div>
            ))}
          </div>
        )}

        {/* Suggested Response */}
        {result.suggested_response_template && (
          <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,padding:20}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
              <p style={{fontSize:11,fontWeight:700,color:'#475569',textTransform:'uppercase'}}>✉️ Response Template</p>
              <button onClick={() => navigator.clipboard.writeText(result.suggested_response_template)}
                style={{fontSize:11,color:'#dc2626',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:6,padding:'4px 10px',cursor:'pointer',fontFamily:'Inter,sans-serif',fontWeight:600}}>
                Copy
              </button>
            </div>
            <p style={{fontSize:13,color:'#374151',lineHeight:1.7}}>{result.suggested_response_template}</p>
          </div>
        )}

        {/* Auto-monitor CTA */}
        {user && itemId && (
          <div style={{background:'#fff5f5',border:'1px solid #fecaca',borderRadius:12,padding:18,display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}>
            <div>
              <p style={{fontSize:13,fontWeight:700,color:'#dc2626',marginBottom:2}}>🔔 Enable Weekly Auto-Digest</p>
              <p style={{fontSize:12,color:'#64748b'}}>HexorIQ will automatically pull your Google & App Store reviews every week and email you a digest.</p>
            </div>
            <button onClick={enableAutoMonitor}
              style={{background:'#dc2626',color:'#fff',padding:'9px 18px',borderRadius:8,border:'none',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'Inter,sans-serif',whiteSpace:'nowrap'}}>
              Enable →
            </button>
          </div>
        )}

        {/* Actions */}
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          <button onClick={() => window.print()}
            style={{flex:1,minWidth:120,padding:'10px',borderRadius:8,border:'1px solid #fecaca',background:'#fef2f2',fontSize:13,fontWeight:600,color:'#dc2626',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
            📕 Print / PDF
          </button>
          <button onClick={() => { setResult(null); setItemId(null); setForm({ business_name:'', reviews:'', time_period:'Last 30 days' }) }}
            style={{flex:1,minWidth:120,padding:'10px',borderRadius:8,border:'1px solid #e2e8f0',background:'#fff',fontSize:13,fontWeight:600,color:'#475569',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
            Analyse another
          </button>
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
              <input value={form.business_name} onChange={e => setForm({...form,business_name:e.target.value})}
                placeholder="e.g. Riverside Coffee Co" style={inputStyle}/>
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
          {!user && <p style={{textAlign:'center',fontSize:12,color:'#94a3b8',marginTop:12}}>
            <Link href="/signup" style={{color:'#dc2626',textDecoration:'none',fontWeight:600}}>Sign up free</Link> to save analyses and enable weekly auto-digests.
          </p>}
        </div>
      </div>
    </div>
  )
}
