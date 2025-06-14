"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sun, Moon, Sunrise, Sunset, Clock } from "lucide-react"

interface SunriseSunsetProps {
  sun?: {
    sunrise?: string
    sunset?: string
    day_length?: string
    solar_noon?: string
    civil_twilight_begin?: string
    civil_twilight_end?: string
    nautical_twilight_begin?: string
    nautical_twilight_end?: string
    astronomical_twilight_begin?: string
    astronomical_twilight_end?: string
  }
  moon?: {
    phase?: string
    illumination?: number
    rise?: string
    set?: string
    next_phase?: string
    next_phase_date?: string
  }
}


export function SunriseSunset({ sun, moon }: SunriseSunsetProps) {
  if (!sun && !moon) {
    return (
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 dark:text-white">
          <CardTitle className="text-2xl font-bold">Sun & Moon</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">No sun or moon data available.</div>
        </CardContent>
      </Card>
    )
  }

  const formatTime = (t?: string) => {
    if (!t) return "-"
    const d = new Date(t)
    return isNaN(d.getTime())
      ? t
      : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatLength = (len?: string) => {
    const sec = Number(len)
    if (isNaN(sec)) return len || "-"
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    return `${h}h ${m}m`
  }

  const phaseName = (val?: string) => {
    const num = Number(val)
    if (isNaN(num)) return val || "-"
    const phases = [
      "New Moon",
      "Waxing Crescent",
      "First Quarter",
      "Waxing Gibbous",
      "Full Moon",
      "Waning Gibbous",
      "Last Quarter",
      "Waning Crescent",
    ]
    const idx = Math.round((num % 1) * 8)
    return phases[idx % 8]
  }

  // Use real data only, show '-' if missing and format nicely
  const sunrise = formatTime(sun?.sunrise)
  const sunset = formatTime(sun?.sunset)
  const day_length = formatLength(sun?.day_length)
  const moonrise = formatTime(moon?.rise)
  const moonset = formatTime(moon?.set)
  const phase = phaseName(moon?.phase)

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 dark:text-white">
        <CardTitle className="text-2xl font-bold flex items-center space-x-2">
          <Sun className="h-6 w-6" />
          <span>Sun & Moon</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Sunrise className="h-5 w-5 text-yellow-600" />
              <span className="font-medium text-gray-900">Sunrise:</span>
              <span className="text-gray-700">{sunrise}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Sunset className="h-5 w-5 text-orange-600" />
              <span className="font-medium text-gray-900">Sunset:</span>
              <span className="text-gray-700">{sunset}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-900">Day Length:</span>
              <span className="text-gray-700">{day_length}</span>
            </div>
          </div>
          {(moonrise !== '-' || moonset !== '-' || phase !== '-') && (
            <div className="space-y-3">
              {moonrise !== '-' && (
                <div className="flex items-center space-x-2">
                  <Moon className="h-5 w-5 text-indigo-600" />
                  <span className="font-medium text-gray-900">Moonrise:</span>
                  <span className="text-gray-700">{moonrise}</span>
                </div>
              )}
              {moonset !== '-' && (
                <div className="flex items-center space-x-2">
                  <Moon className="h-5 w-5 text-indigo-800" />
                  <span className="font-medium text-gray-900">Moonset:</span>
                  <span className="text-gray-700">{moonset}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Moon className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-900">Phase:</span>
                <span className="text-gray-700">{phase}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
