import { NextResponse } from 'next/server'

const API_URL = 'http://localhost:8000'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const stationId = searchParams.get('station_id')
  const latitude = searchParams.get('latitude')
  const longitude = searchParams.get('longitude')

  if (!stationId && (!latitude || !longitude)) {
    return NextResponse.json(
      { error: 'Either station_id or latitude/longitude is required' },
      { status: 400 }
    )
  }

  try {
    let url = `${API_URL}/api/weather/unified/`
    if (stationId) {
      url += `?station_id=${stationId}`
    } else {
      url += `?latitude=${latitude}&longitude=${longitude}`
    }
    
    console.log('Fetching from:', url)
    
    const response = await fetch(url)
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `API responded with status: ${response.status}`)
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error fetching weather data:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch weather data' },
      { status: 500 }
    )
  }
} 