import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')
  const latitude = searchParams.get('latitude')
  const longitude = searchParams.get('longitude')
  if (!q && !(latitude && longitude)) {
    return NextResponse.json(
      { error: 'Missing query or coordinates' },
      { status: 400 }
    )
  }

  try {
    const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000'
    let url: string
    if (q) {
      url = `${backendUrl}/api/weather/geocode/?query=${encodeURIComponent(q)}`
    } else {
      url = `${backendUrl}/api/weather/geocode/?latitude=${encodeURIComponent(latitude!)}&longitude=${encodeURIComponent(longitude!)}`
    }

    const res = await fetch(url)
    if (!res.ok) {
      const errorBody = await res.text()
      console.error(`Backend error: ${res.status} ${res.statusText}`, errorBody)
      return NextResponse.json({ error: 'Backend error', status: res.status, details: errorBody }, { status: res.status })
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch from backend', details: String(error) },
      { status: 500 }
    )
  }
}
