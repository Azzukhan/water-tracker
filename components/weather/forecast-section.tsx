"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Cloud, Sun, CloudRain, Wind, Droplets, Calendar } from "lucide-react"

interface ForecastSectionProps {
  daily: Array<{
    date: string
    day: string
    high: number
    low: number
    condition: string
    description: string
    icon: string
    precipitation: number
    humidity: number
    wind_speed: number
    wind_direction: string
    uv_index: number
    temperature_max?: number
    temperature_min?: number
  }>
}

const getWeatherIcon = (icon: string) => {
  switch (icon) {
    case "sunny":
      return Sun
    case "cloudy":
      return Cloud
    case "rainy":
      return CloudRain
    default:
      return Cloud
  }
}

const getUVIndexColor = (index: number) => {
  if (index <= 2) return "bg-green-600"
  if (index <= 5) return "bg-yellow-600"
  if (index <= 7) return "bg-orange-600"
  if (index <= 10) return "bg-red-600"
  return "bg-purple-600"
}

const getUVIndexText = (index: number) => {
  if (index <= 2) return "Low"
  if (index <= 5) return "Moderate"
  if (index <= 7) return "High"
  if (index <= 10) return "Very High"
  return "Extreme"
}

export function ForecastSection({ daily }: ForecastSectionProps) {
  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-xl font-bold">7-Day Forecast</CardTitle>
        <p className="text-gray-600">Extended weather forecast</p>
      </CardHeader>
      <CardContent className="p-8">
        <div className="space-y-6">
          {daily.map((day, idx) => (
            <div key={day.date + '-' + idx} className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-2">
                <span className="font-medium w-24">{day.day}</span>
                <span className="text-gray-500 text-xs">{day.date}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold">{(day.high ?? day.temperature_max) !== undefined ? `${day.high ?? day.temperature_max}°C` : 'N/A'}</span>
                <span className="text-lg font-bold">{(day.low ?? day.temperature_min) !== undefined ? `${day.low ?? day.temperature_min}°C` : 'N/A'}</span>
                <span className="text-gray-500">{day.condition}</span>
                <span className="text-gray-500">{day.wind_speed ? `${day.wind_speed} mph` : ''}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
