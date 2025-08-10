import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import dynamic from "next/dynamic"

const RainRadarMap = dynamic(() => import("./rain-radar-map"), { ssr: false })

export function RainRadar() {
  return (
    <Card className="shadow-lg border-0 flex flex-col h-full min-h-[540px]">
  <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white h-24 flex flex-col justify-center">
    <div className="flex items-center justify-between">
      <div>
        <CardTitle className="text-2xl font-bold">Rain Radar</CardTitle>
        <p className="text-blue-100">Live precipitation tracking</p>
      </div>
      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">Live</Badge>
    </div>
  </CardHeader>
  <CardContent className="p-6 flex flex-col flex-1">
    <div className="flex-1 flex flex-col justify-between">
      <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
        <RainRadarMap />
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">Use scroll or the +/- controls to zoom</p>
    </div>
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mt-4">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            <div className="font-medium mb-2">Radar Legend:</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-200 rounded-full"></div>
                <span>Light Rain</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span>Moderate Rain</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <span>Heavy Rain</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-800 rounded-full"></div>
                <span>Intense Rain</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
