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
        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead>
              <tr className="border-b text-sm">
                <th className="p-2 text-left">Day</th>
                <th className="p-2">High</th>
                <th className="p-2">Low</th>
                <th className="p-2">Condition</th>
                <th className="p-2">Wind</th>
                <th className="p-2">Precip</th>
                <th className="p-2">UV</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {daily.map((day, idx) => {
                const Icon = getWeatherIcon(day.icon)
                return (
                  <tr key={day.date + '-' + idx} className="text-sm">
                    <td className="p-2 text-left">
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{day.day}</span>
                      </div>
                    </td>
                    <td className="p-2 font-medium">{Math.round(day.high ?? day.temperature_max ?? 0)}°C</td>
                    <td className="p-2 font-medium">{Math.round(day.low ?? day.temperature_min ?? 0)}°C</td>
                    <td className="p-2">{day.condition}</td>
                    <td className="p-2">{day.wind_speed ? `${Math.round(day.wind_speed)} mph` : '-'}</td>
                    <td className="p-2">{day.precipitation !== undefined ? `${Math.round(day.precipitation)}%` : '-'}</td>
                    <td className="p-2">
                      {day.uv_index !== undefined && (
                        <span className={`text-xs text-white px-1 rounded ${getUVIndexColor(day.uv_index)}`}>{getUVIndexText(day.uv_index)}</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
