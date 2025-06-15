import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000'
    const res = await fetch(`${backendUrl}/api/stories/stories/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const body = await res.text()
    if (!res.ok) {
      console.error(`Backend error: ${res.status} ${res.statusText}`, body)
      return NextResponse.json({ error: 'Backend error', status: res.status }, { status: res.status })
    }
    return NextResponse.json(JSON.parse(body))
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit story', details: String(error) }, { status: 500 })
  }
}

export async function GET() {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000'
    const res = await fetch(`${backendUrl}/api/stories/stories/`)
    const body = await res.text()
    if (!res.ok) {
      console.error(`Backend error: ${res.status} ${res.statusText}`, body)
      return NextResponse.json({ error: 'Backend error', status: res.status }, { status: res.status })
    }
    return NextResponse.json(JSON.parse(body))
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stories', details: String(error) }, { status: 500 })
  }
}
