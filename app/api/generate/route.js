import { NextResponse } from 'next/server'
export async function POST(request) {
  try {
    const body = await request.json()
    const { business_name, reviews, time_period, userId } = body
    if (!business_name || !reviews) return NextResponse.json({ error: 'business_name and reviews are required' }, { status: 400 })
    const aiRes = await fetch(`${process.env.AI_API_URL}/api/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.AI_API_KEY}` },
      body: JSON.stringify({ task: 'summarise_reviews', inputs: { business_name, reviews, time_period: time_period || 'Last 30 days' } })
    })
    const aiData = await aiRes.json()
    if (!aiRes.ok) throw new Error(aiData.error || 'AI failed')
    const result = aiData.data
    let itemId = null
    if (userId && process.env.DB_API_URL) {
      try {
        const dbRes = await fetch(`${process.env.DB_API_URL}/db/hexoriq/summaries`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.DB_API_KEY_HEXORIQ}` },
          body: JSON.stringify({ user_id: userId, title: `${business_name} — ${time_period}`, business_name, time_period, result_data: result, status: 'complete' })
        })
        const dbData = await dbRes.json()
        itemId = dbData.data?.id || null
      } catch(e) {}
    }
    return NextResponse.json({ itemId, result })
  } catch(err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
