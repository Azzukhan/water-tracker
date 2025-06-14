"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
    temperature_max?: number
    temperature_min?: number
  }>
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
                  <th className="p-2">Rain</th>
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
                      <td className="p-2">{day.precipitation !== undefined ? `${Math.round(day.precipitation)}%` : '-'}</td>
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
