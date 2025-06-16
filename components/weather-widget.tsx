"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { getWeatherIcon } from "@/lib/weather-icons"

interface WeatherData {
  location: string
  temperature: number
  condition: string
  icon: string
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const DEFAULT = { lat: 51.5074, lon: -0.1278 }

    function fetchWeather(lat: number, lon: number) {
      setLoading(true)
      fetch(`/api/weather/unified/?latitude=${lat}&longitude=${lon}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch weather")
          return res.json()
        })
        .then((data) => {
          setWeather({
            location: `${data.location.name}, ${data.location.region}`,
            temperature: data.current.temperature,
            condition: data.current.condition,
            icon: data.current.icon,
          })
          setError(null)
        })
        .catch((err) => {
          console.error(err)
          setError("Failed to load weather data")
        })
        .finally(() => setLoading(false))
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchWeather(pos.coords.latitude, pos.coords.longitude)
        },
        () => fetchWeather(DEFAULT.lat, DEFAULT.lon)
      )
    } else {
      fetchWeather(DEFAULT.lat, DEFAULT.lon)
    }
  }, [])

  if (loading) {
    return (
      <Card className="shadow border-gray-100">
        <CardContent className="p-6 text-center">Loading weather...</CardContent>
      </Card>
    )
  }

  if (error || !weather) {
    return (
      <Card className="shadow border-gray-100">
        <CardContent className="p-6 text-center text-destructive">
          {error || "No weather data"}
        </CardContent>
      </Card>
    )
  }

  const WeatherIcon = getWeatherIcon(weather.icon)

  return (
    <Card className="shadow border-gray-100">
      <CardContent className="p-6 flex items-center gap-4">
        <WeatherIcon className="h-10 w-10 text-blue-500" />
        <div>
          <div className="font-semibold text-gray-900">
            {weather.location}
          </div>
          <div className="text-2xl font-bold">
            {Math.round(weather.temperature)}°C
          </div>
          <div className="text-sm text-gray-600">{weather.condition}</div>
        </div>
      </CardContent>
    </Card>
  )
}
