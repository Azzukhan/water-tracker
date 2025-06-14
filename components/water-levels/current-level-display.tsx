"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus, Droplets, Calendar, AlertTriangle } from "lucide-react"
import { LineChart, Line, ResponsiveContainer } from "recharts"

const currentData = {
  region: "London & Thames Valley",
  currentLevel: 78,
  averageLevel: 82,
  lastUpdated: "2 minutes ago",
  trend: "stable",
  status: "Normal",
  capacity: "2.4 billion litres",
  change24h: -2.1,
  changeWeek: -5.3,
}

const sparklineData = [
  { value: 85 },
  { value: 83 },
  { value: 81 },
  { value: 79 },
  { value: 78 },
  { value: 80 },
  { value: 78 },
]

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case "up":
      return TrendingUp
    case "down":
      return TrendingDown
    default:
      return Minus
  }
}

const getTrendColor = (trend: string) => {
  switch (trend) {
    case "up":
      return "text-green-600"
    case "down":
      return "text-red-600"
    default:
      return "text-gray-600"
  }
}

export function CurrentLevelDisplay() {
  const TrendIcon = getTrendIcon(currentData.trend)
  const percentage = (currentData.currentLevel / 100) * 100

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Main Level Display */}
      <Card className="lg:col-span-2 shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Current Water Level</CardTitle>
              <p className="text-blue-100">{currentData.region}</p>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              Live Data
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Level Gauge */}
            <div className="text-center">
              <div className="relative w-48 h-48 mx-auto mb-6">
                {/* Circular Progress */}
                <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${percentage * 2.51} 251`}
                    className="text-blue-600 transition-all duration-1000 ease-out"
                  />
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-4xl font-bold text-gray-900">{currentData.currentLevel}%</div>
                  <div className="text-sm text-gray-600">Full</div>
                  <Droplets className="h-6 w-6 text-blue-500 mt-2" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-lg font-semibold text-gray-900">Capacity: {currentData.capacity}</div>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Updated {currentData.lastUpdated}</span>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Level Statistics</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-sm text-gray-600">vs. Average</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {currentData.currentLevel - currentData.averageLevel > 0 ? "+" : ""}
                        {currentData.currentLevel - currentData.averageLevel}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Average Level</div>
                      <div className="text-lg font-semibold text-gray-900">{currentData.averageLevel}%</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <div className="text-sm text-gray-600">24h Change</div>
                      <div
                        className={`text-lg font-semibold flex items-center ${
                          currentData.change24h > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        <TrendIcon className="h-4 w-4 mr-1" />
                        {currentData.change24h > 0 ? "+" : ""}
                        {currentData.change24h}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">7d Change</div>
                      <div
                        className={`text-lg font-semibold flex items-center justify-end ${
                          currentData.changeWeek > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        <TrendIcon className="h-4 w-4 mr-1" />
                        {currentData.changeWeek > 0 ? "+" : ""}
                        {currentData.changeWeek}%
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-600">Status</div>
                        <div className="text-lg font-semibold text-green-700">{currentData.status}</div>
                      </div>
                      <Badge className="bg-green-600 text-white">Operational</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sparkline Chart */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">7-Day Trend</CardTitle>
          <p className="text-sm text-gray-600">Recent water level changes</p>
        </CardHeader>
        <CardContent>
          <div className="h-32 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Highest</span>
              <span className="font-semibold">85%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Lowest</span>
              <span className="font-semibold">78%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Average</span>
              <span className="font-semibold">81%</span>
            </div>
          </div>

          {currentData.currentLevel < 70 && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">Below Normal Range</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
