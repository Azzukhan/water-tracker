import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')
  if (!q) {
    return NextResponse.json({ error: 'Missing query parameter q' }, { status: 400 })
  }
  try {
    // Replace with your actual backend URL
    const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000'
    const res = await fetch(`${backendUrl}/api/weather/geocode/?query=${encodeURIComponent(q)}`)
    if (!res.ok) {
      const errorBody = await res.text()
      console.error(`Backend error: ${res.status} ${res.statusText}`, errorBody)
      return NextResponse.json({ error: 'Backend error', status: res.status, details: errorBody }, { status: res.status })
    }
    const data = await res.json()
    console.log('Backend geocode response:', data)
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch from backend', details: String(error) }, { status: 500 })
  }
} 