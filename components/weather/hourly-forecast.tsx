import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getWeatherIcon } from "@/lib/weather-icons"
import { Droplet } from "lucide-react"

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
              const formattedTime = String(time.getHours())

              return (
                <div
                  key={hour.time + '-' + idx}
                  className="flex-none w-24 flex flex-col items-center p-3 bg-white rounded-lg shadow"
                >
                  <div className="text-sm font-medium">{formattedTime}</div>
                  <WeatherIcon className="h-8 w-8 my-2 text-blue-500" />
                  <div className="flex items-center mt-1">
                    <Droplet className="h-4 w-4 text-gray-500 mr-1" />
                    <span className="text-sm font-medium">
                      {hour.precipitation_probability != null
                        ? `${Math.round(hour.precipitation_probability)}%`
                        : "-"}
                    </span>
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
