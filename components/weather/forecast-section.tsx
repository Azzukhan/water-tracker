"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wind, Droplets, Calendar } from "lucide-react"
import { getWeatherIcon } from "@/lib/weather-icons"

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
          {daily.map((day, idx) => {
            const Icon = getWeatherIcon(day.icon)
            return (
              <div key={day.date + '-' + idx} className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-2">
                  <span className="font-medium w-24">{day.day}</span>
                  <span className="text-gray-500 text-xs">{day.date}</span>
                </div>
                <div className="flex items-center gap-4">
                  <Icon className="h-5 w-5 text-blue-500" />
                  <span className="text-lg font-bold">{(day.high ?? day.temperature_max) !== undefined ? `${day.high ?? day.temperature_max}°C` : 'N/A'}</span>
                  <span className="text-lg font-bold">{(day.low ?? day.temperature_min) !== undefined ? `${day.low ?? day.temperature_min}°C` : 'N/A'}</span>
                  <span className="text-gray-500">{day.condition}</span>
                  <span className="text-gray-500">{day.wind_speed ? `${day.wind_speed} mph` : ''}</span>
                  {day.precipitation !== undefined && (
                    <div className="flex items-center text-sm text-blue-600 gap-1">
                      <Droplets className="h-4 w-4" />
                      <span>{day.precipitation}%</span>
                    </div>
                  )}
                  {day.uv_index !== undefined && (
                    <div className={`text-xs text-white px-1 rounded ${getUVIndexColor(day.uv_index)}`}>{getUVIndexText(day.uv_index)}</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
