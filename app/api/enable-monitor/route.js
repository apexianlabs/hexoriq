import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { itemId, business_name } = await request.json()
    if (!itemId) return NextResponse.json({ error: 'itemId required' }, { status: 400 })

    // Update the summary record to enable auto_monitor
    const res = await fetch(`${process.env.DB_API_URL}/db/hexoriq/summaries/${itemId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DB_API_KEY_HEXORIQ}`
      },
      body: JSON.stringify({
        result_data: { auto_monitor: true, business_name }
      })
    })

    if (!res.ok) throw new Error('Failed to enable monitor')
    return NextResponse.json({ success: true })
  } catch(err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
