"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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

const DEFAULT_SUN = {
  sunrise: "06:00",
  sunset: "18:00",
  day_length: "12h 00m",
  solar_noon: "12:00",
  civil_twilight_begin: "05:30",
  civil_twilight_end: "18:30",
  nautical_twilight_begin: "04:45",
  nautical_twilight_end: "19:15",
  astronomical_twilight_begin: "04:00",
  astronomical_twilight_end: "20:00"
}

const DEFAULT_MOON = {
  phase: "Waxing Crescent",
  illumination: 45,
  rise: "10:00",
  set: "22:00",
  next_phase: "First Quarter",
  next_phase_date: "Tomorrow"
}

export function SunriseSunset({ sun, moon }: SunriseSunsetProps) {
  if (!sun && !moon) {
    return (
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
          <CardTitle className="text-2xl font-bold">Sun & Moon</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">No sun or moon data available.</div>
        </CardContent>
      </Card>
    )
  }

  // Use real data only, show '-' if missing
  const sunrise = sun?.sunrise || "-"
  const sunset = sun?.sunset || "-"
  const day_length = sun?.day_length || "-"
  const moonrise = moon?.rise || "-"
  const moonset = moon?.set || "-"
  const phase = moon?.phase || "-"

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
        <CardTitle className="text-2xl font-bold">Sun & Moon</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="font-semibold text-gray-900 mb-2">Sunrise</div>
            <div className="text-lg text-yellow-600">{sunrise}</div>
            <div className="font-semibold text-gray-900 mt-4 mb-2">Sunset</div>
            <div className="text-lg text-orange-600">{sunset}</div>
            <div className="font-semibold text-gray-900 mt-4 mb-2">Day Length</div>
            <div className="text-lg text-gray-700">{day_length}</div>
          </div>
          <div>
            <div className="font-semibold text-gray-900 mb-2">Moonrise</div>
            <div className="text-lg text-indigo-600">{moonrise}</div>
            <div className="font-semibold text-gray-900 mt-4 mb-2">Moonset</div>
            <div className="text-lg text-indigo-800">{moonset}</div>
            <div className="font-semibold text-gray-900 mt-4 mb-2">Phase</div>
            <div className="text-lg text-gray-700">{phase}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
