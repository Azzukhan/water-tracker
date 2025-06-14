import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getWeatherIcon } from "@/lib/weather-icons"

interface HourlyForecastProps {
  hourly: Array<{
    time: string
    temperature: number
    condition: string
    icon: string
    precipitation_probability: number
    wind_speed: number
    wind_direction: string
  }>
}

export function HourlyForecast({ hourly }: HourlyForecastProps) {
  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Hourly Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="flex space-x-4 min-w-max">
            {hourly.map((hour, idx) => {
              const WeatherIcon = getWeatherIcon(hour.icon)
              const time = new Date(hour.time)
              const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              
              return (
                <div key={hour.time + '-' + idx} className="flex flex-col items-center p-4 bg-white rounded-lg shadow">
                  <div className="text-sm font-medium">{formattedTime}</div>
                  <WeatherIcon className="h-8 w-8 my-2 text-blue-500" />
                  <div className="text-lg font-bold">{Math.round(hour.temperature)}°C</div>
                  <div className="text-sm text-gray-600">{hour.condition}</div>
                  <div className="flex items-center mt-2">
                    <svg className="h-4 w-4 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    <span className="text-sm">{Math.round(hour.precipitation_probability)}%</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <svg className="h-4 w-4 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    <span className="text-sm">{Math.round(hour.wind_speed)} mph</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 