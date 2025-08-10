"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getWeatherIcon } from "@/lib/weather-icons"

interface CurrentConditionsProps {
  station?: {
    name: string
    region: string
  }
  location: {
    lat: number
    lon: number
  }
  temperature: number
  feels_like: number
  condition: string
  description: string
  humidity: number
  wind_speed: number
  wind_direction: string
  visibility: number
  pressure: number
  uv_index: number
  icon: string
  last_updated: string
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

export function CurrentConditions({
  station,
  location,
  temperature,
  feels_like,
  condition,
  description,
  humidity,
  wind_speed,
  wind_direction,
  visibility,
  pressure,
  uv_index,
  icon,
  last_updated
}: CurrentConditionsProps) {
  const d = new Date(last_updated)
  const isNight = d.getHours() < 6 || d.getHours() >= 18
  const WeatherIcon = getWeatherIcon(icon, isNight)

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Current Conditions</CardTitle>
        {station && (
          <p className="text-gray-600 dark:text-gray-300">{station.name}, {station.region}</p>
        )}
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Last updated:{" "}
          {(() => {
            const d = new Date(last_updated)
            return isNaN(d.getTime()) ? "N/A" : d.toLocaleString()
          })()}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Current Weather */}
          <div className="flex items-center space-x-4">
            <WeatherIcon className="h-16 w-16 text-blue-500 dark:text-blue-400" />
            <div>
              <div className="text-4xl font-bold">{Math.round(temperature)}°C</div>
              <div className="text-gray-600 dark:text-gray-300">Feels like {Math.round(feels_like)}°C</div>
              <div className="text-lg font-medium">{description === 'Unknown' ? 'Sunny' : description}</div>
            </div>
          </div>

          {/* Weather Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <svg className="h-5 w-5 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Humidity</div>
                <div className="font-medium">{Math.round(humidity)}%</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="h-5 w-5 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Wind</div>
                <div className="font-medium">{Math.round(wind_speed)} mph {wind_direction}°</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="h-5 w-5 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Visibility</div>
                <div className="font-medium">{Math.round(visibility)} km</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="h-5 w-5 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Pressure</div>
                <div className="font-medium">{Math.round(pressure)} hPa</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="h-5 w-5 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M7.05 16.95l-1.414 1.414m0-12.728l1.414 1.414m10.314 10.314l1.414 1.414" />
              </svg>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-300">UV Index</div>
                <div className={`font-medium px-2 rounded ${getUVIndexColor(uv_index)} text-gray-900 dark:text-white`}>{Math.round(uv_index)} ({getUVIndexText(uv_index)})</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
