import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000'
    const url = new URL(req.url)
    const params = url.search
    const res = await fetch(
      `${backendUrl}/api/water-levels/southernwater-reservoirs/${params}`
    )
    if (!res.ok) {
      const body = await res.text()
      console.error(`Backend error: ${res.status} ${res.statusText}`, body)
      return NextResponse.json({ error: 'Backend error', status: res.status }, { status: res.status })
    }
    const data = await res.json()
    const results = Array.isArray(data) ? data : data.results ?? []
    return NextResponse.json(results)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch from backend', details: String(error) },
      { status: 500 }
    )
  }
}
