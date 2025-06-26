import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sun, Moon, Sunrise, Sunset, Clock } from "lucide-react"

function formatTime(t) {
  if (!t) return "-"
  const d = new Date(t)
  if (isNaN(d.getTime())) return t
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function formatDayLength(sec) {
  if (!sec) return "-"
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  return `${h}h ${m}m`
}

export function SunriseSunset({ sun, moon }) {
  const sunrise = formatTime(sun?.sunrise)
  const sunset = formatTime(sun?.sunset)
  const day_length = formatDayLength(sun?.day_length)
  const phase = moon?.phase || "New Moon"

  return (
    <Card className="shadow-lg border-0 flex flex-col h-full min-h-[540px]">
      <CardHeader className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white h-24 flex flex-col justify-center">
        <CardTitle className="text-2xl font-bold flex items-center space-x-2">
          <Sun className="h-6 w-6" />
          <span>Sun & Moon</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 flex flex-col flex-1">
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Sunrise/Sunset Row */}
          <div className="flex items-center gap-8 mb-6">
            <div className="flex flex-col items-center">
              <Sunrise className="h-8 w-8 text-yellow-500 mb-1" />
              <span className="text-xs text-gray-500">Sunrise</span>
              <span className="font-semibold text-lg">{sunrise}</span>
            </div>
            <div className="flex flex-col items-center">
              <Sunset className="h-8 w-8 text-orange-500 mb-1" />
              <span className="text-xs text-gray-500">Sunset</span>
              <span className="font-semibold text-lg">{sunset}</span>
            </div>
          </div>
          {/* Phase and Day Length */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <Moon className="h-6 w-6 text-indigo-500" />
              <span className="font-medium text-gray-700">Phase:</span>
              <span className="text-gray-900">{phase}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-6 w-6 text-gray-600" />
              <span className="font-medium text-gray-700">Day Length:</span>
              <span className="text-gray-900">{day_length}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
