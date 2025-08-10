import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Leaf, AlertTriangle, CheckCircle, Wind } from "lucide-react"

export function AirQuality({ aqi }) {
  const valueNum = typeof aqi?.value === 'number' ? Math.round(aqi.value) : undefined
  const statusStr = typeof aqi?.status === 'string' ? aqi.status : '-'
  const pollutants = aqi?.pollutants || []
  const descStr = typeof aqi?.description === 'string' ? aqi.description : '-'

  return (
    <Card className="shadow-lg border-0 flex flex-col h-full min-h-[540px]">
  <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white h-24 flex flex-col justify-center">
    <div className="flex items-center justify-between">
      <div>
        <CardTitle className="text-2xl font-bold">Air Quality</CardTitle>
        <p className="text-green-100">Real-time air quality index</p>
      </div>
      <div className="flex items-center space-x-2">
        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">Live</Badge>
        <div className="flex items-center text-sm text-green-100">
              <CheckCircle className="h-4 w-4 mr-1" />
              {statusStr}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 flex flex-col flex-1">
        <div className="flex-1 flex flex-col justify-between">
          {/* Main AQI Display */}
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">{valueNum ?? '-'}</div>
            <div className="flex items-center justify-center space-x-2">
              <Badge className="bg-green-600 text-white">
                {valueNum && valueNum <= 3
                  ? "Low"
                  : valueNum && valueNum <= 6
                  ? "Moderate"
                  : valueNum && valueNum <= 9
                  ? "High"
                  : "Very High"}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{descStr}</p>
          </div>
          {/* Pollutants */}
          <div className="space-y-4 mt-6">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Pollutants</h4>
            {pollutants.length === 0 ? (
              <div className="text-gray-500 dark:text-gray-400 text-sm">No pollutant data available.</div>
            ) : (
              pollutants.map((pollutant, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Wind className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{pollutant.name || '-'}</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {typeof pollutant.value === 'number' ? Math.round(pollutant.value) : '-'} {pollutant.unit || ''}
                    </div>
                  </div>
                  <Progress
                    value={typeof pollutant.value === 'number' && typeof pollutant.max === 'number'
                      ? (pollutant.value / pollutant.max) * 100 : 0}
                    className={`h-2 bg-green-600`}
                  />
                </div>
              ))
            )}
          </div>
        </div>
        {/* Footer: Forecast (optional) */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mt-4">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">3-Day Forecast</h4>
          <div className="space-y-3">
            {!aqi?.forecast?.length ? (
              <div className="text-gray-500 dark:text-gray-400 text-sm">No forecast data available.</div>
            ) : (
              aqi.forecast.map((day, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{day.day || '-'}</span>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-600 text-white text-xs">
                      {typeof day.aqi === 'number' ? Math.round(day.aqi) : '-'}
                    </Badge>
                    <span className="text-sm text-gray-900 dark:text-gray-100">{day.status || '-'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
