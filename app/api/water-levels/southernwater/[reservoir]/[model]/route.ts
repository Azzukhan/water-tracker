import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: { reservoir: string; model: string } }
) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000'
    const { reservoir, model } = params
    const res = await fetch(
      `${backendUrl}/api/water-levels/southernwater/${reservoir}/${model}/`
    )
    if (!res.ok) {
      const body = await res.text()
      console.error(`Backend error: ${res.status} ${res.statusText}`, body)
      return NextResponse.json({ error: 'Backend error', status: res.status }, { status: res.status })
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
