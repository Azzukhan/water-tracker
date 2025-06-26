"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Leaf, AlertTriangle, CheckCircle, Wind } from "lucide-react"

interface AirQualityProps {
  aqi?: {
    value?: number
    status?: string
    description?: string
    pollutants?: Array<{
      name: string
      value: number
      unit: string
      max: number
      status: string
    }>
    forecast?: Array<{
      day: string
      aqi: number
      status: string
    }>
  }
}

const getAQIColor = (aqi: number) => {
  if (aqi <= 3) return "bg-green-600"
  if (aqi <= 6) return "bg-yellow-600"
  if (aqi <= 9) return "bg-orange-600"
  return "bg-red-600"
}

const getAQIText = (aqi: number) => {
  if (aqi <= 3) return "Low"
  if (aqi <= 6) return "Moderate"
  if (aqi <= 9) return "High"
  return "Very High"
}

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "low":
      return CheckCircle
    case "moderate":
      return Leaf
    case "high":
    case "very high":
      return AlertTriangle
    default:
      return AlertTriangle
  }
}

export function AirQuality({ aqi }: AirQualityProps) {
  if (!aqi) {
    return (
      <Card className="shadow-lg border-0 flex flex-col h-full min-h-[540px]">
        <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-gray-900 dark:text-white">
          <CardTitle className="text-2xl font-bold">Air Quality</CardTitle>
        </CardHeader>
        <CardContent className="p-6 flex flex-col flex-1">
          <div className="text-center text-gray-500">No air quality data available.</div>
        </CardContent>
      </Card>
    )
  }
  const {
    value,
    status,
    description,
    pollutants = [],
    forecast = []
  } = aqi
  const valueNum = typeof value === 'number' ? Math.round(value) : undefined
  const statusStr = typeof status === 'string' ? status : '-'
  const descStr = typeof description === 'string' ? description : '-'
  const StatusIcon = getStatusIcon(statusStr)
  return (
    <Card className="shadow-lg border-0 flex flex-col h-full">
      <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-gray-900 dark:text-white">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Air Quality</CardTitle>
            <p className="text-green-100">Real-time air quality index</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              Live
            </Badge>
            <div className="flex items-center text-sm text-green-100">
              <StatusIcon className="h-4 w-4 mr-1" />
              {statusStr}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 flex flex-col flex-1">
        <div className="space-y-6">
          {/* Main AQI Display */}
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">{valueNum ?? '-'}</div>
            <div className="flex items-center justify-center space-x-2">
              <Badge className={`${getAQIColor(valueNum ?? 0)} text-white`}>
                {getAQIText(valueNum ?? 0)}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mt-2">{descStr}</p>
          </div>
          {/* Pollutants */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Pollutants</h4>
            {pollutants.length === 0 ? (
              <div className="text-gray-500 text-sm">No pollutant data available.</div>
            ) : (
              pollutants.map((pollutant, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Wind className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">{pollutant.name || '-'}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {typeof pollutant.value === 'number' ? Math.round(pollutant.value) : '-'} {pollutant.unit || ''}
                    </div>
                  </div>
                  <Progress
                    value={typeof pollutant.value === 'number' && typeof pollutant.max === 'number' ? (pollutant.value / pollutant.max) * 100 : 0}
                    className={`h-2 ${getAQIColor(typeof pollutant.value === 'number' ? Math.round(pollutant.value) : 0)}`}
                  />
                </div>
              ))
            )}
          </div>
          {/* Forecast */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">3-Day Forecast</h4>
            <div className="space-y-3">
              {forecast.length === 0 ? (
                <div className="text-gray-500 text-sm">No forecast data available.</div>
              ) : (
                forecast.map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{day.day || '-'}</span>
                    <div className="flex items-center space-x-2">
                      <Badge className={`${getAQIColor(typeof day.aqi === 'number' ? Math.round(day.aqi) : 0)} text-white text-xs`}>
                        {typeof day.aqi === 'number' ? Math.round(day.aqi) : '-'}
                      </Badge>
                      <span className="text-sm text-gray-900">{day.status || '-'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
