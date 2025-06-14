import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Cloud, Sun, CloudRain, Wind, Thermometer, Droplets, Eye, ArrowRight } from "lucide-react"
import Link from "next/link"

const currentWeather = {
  location: "London, UK",
  temperature: 18,
  condition: "Partly Cloudy",
  humidity: 65,
  windSpeed: 12,
  visibility: 10,
  uvIndex: 4,
  icon: Cloud,
}

const forecast = [
  { day: "Today", high: 20, low: 15, condition: "Cloudy", icon: Cloud },
  { day: "Tomorrow", high: 22, low: 16, condition: "Sunny", icon: Sun },
  { day: "Wednesday", high: 19, low: 14, condition: "Rain", icon: CloudRain },
  { day: "Thursday", high: 21, low: 15, condition: "Partly Cloudy", icon: Cloud },
]

export function WeatherCard() {
  return (
    <Card className="shadow-lg border-0 h-fit">
      <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Current Weather</CardTitle>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            Live
          </Badge>
        </div>
        <p className="text-cyan-100">{currentWeather.location}</p>
      </CardHeader>

      <CardContent className="p-6">
        {/* Current Weather */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <currentWeather.icon className="h-16 w-16 text-blue-500" />
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold text-gray-900">{currentWeather.temperature}°C</div>
            <div className="text-lg text-gray-600">{currentWeather.condition}</div>
          </div>
        </div>

        {/* Weather Details */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <Droplets className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <div className="text-sm text-gray-600">Humidity</div>
            <div className="text-lg font-semibold text-gray-900">{currentWeather.humidity}%</div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 text-center">
            <Wind className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <div className="text-sm text-gray-600">Wind</div>
            <div className="text-lg font-semibold text-gray-900">{currentWeather.windSpeed} mph</div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <Eye className="h-6 w-6 text-orange-500 mx-auto mb-2" />
            <div className="text-sm text-gray-600">Visibility</div>
            <div className="text-lg font-semibold text-gray-900">{currentWeather.visibility} km</div>
          </div>

          <div className="bg-red-50 rounded-lg p-4 text-center">
            <Thermometer className="h-6 w-6 text-red-500 mx-auto mb-2" />
            <div className="text-sm text-gray-600">UV Index</div>
            <div className="text-lg font-semibold text-gray-900">{currentWeather.uvIndex}</div>
          </div>
        </div>

        {/* 4-Day Forecast */}
        <div className="space-y-4 mb-6">
          <h3 className="font-semibold text-gray-900">4-Day Forecast</h3>
          {forecast.map((day, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <day.icon className="h-5 w-5 text-blue-500" />
                <span className="font-medium text-gray-900">{day.day}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">{day.condition}</span>
                <div className="text-right">
                  <span className="font-semibold text-gray-900">{day.high}°</span>
                  <span className="text-gray-500 ml-1">{day.low}°</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
          <Link href="/weather">
            Check Full Weather Report
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
