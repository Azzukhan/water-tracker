import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000'
    const url = new URL(req.url)
    let nextUrl: string | null = `${backendUrl}/api/water-levels/severn-trent-reservoirs/${url.search}`
    const results: any[] = []

    while (nextUrl) {
      const res = await fetch(nextUrl)
      if (!res.ok) {
        const body = await res.text()
        console.error(`Backend error: ${res.status} ${res.statusText}`, body)
        return NextResponse.json(
          { error: 'Backend error', status: res.status },
          { status: res.status }
        )
      }
      const data = await res.json()
      const pageResults = Array.isArray(data) ? data : data.results ?? []
      results.push(...pageResults)
      nextUrl = data.next ?? null
    }

    return NextResponse.json(results)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch from backend', details: String(error) },
      { status: 500 }
    )
  }
}
