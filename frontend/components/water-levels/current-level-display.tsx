"use client"

import { useEffect, useState } from "react"
import { API_BASE } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus, Droplets, Calendar, AlertTriangle } from "lucide-react"
import { calculateTrendMeta } from "@/lib/utils"
import { LineChart, Line, ResponsiveContainer } from "recharts"

interface CurrentData {
  region: string
  currentLevel: number
  averageLevel: number
  lastUpdated: string
  changeWeek: number
  differenceFromAverage: number
}

interface TrendPoint {
  value: number
}

const generateTrend = (current: number, change: number): number[] => {
  const start = current - change
  const step = change / 6
  return Array.from({ length: 7 }, (_, i) => +(start + step * i).toFixed(2))
}

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case "up":
    case "rising":
      return TrendingUp
    case "down":
    case "falling":
      return TrendingDown
    default:
      return Minus
  }
}

const getTrendColor = (trend: string) => {
  switch (trend) {
    case "up":
    case "rising":
      return "text-green-600 dark:text-green-400 cb:text-cbBluishGreen"
    case "down":
    case "falling":
      return "text-red-600 dark:text-red-400 cb:text-cbVermillion"
    default:
      return "text-gray-600 dark:text-gray-300"
  }
}

interface CurrentLevelDisplayProps {
  region: string
}

export function CurrentLevelDisplay({ region }: CurrentLevelDisplayProps) {
  const [currentData, setCurrentData] = useState<CurrentData | null>(null)
  const [sparklineData, setSparklineData] = useState<TrendPoint[]>([])
  const [stats, setStats] = useState({ highest: 0, lowest: 0, average: 0 })

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (region === "scotland") {
          const res = await fetch(`${API_BASE}/api/water-levels/scottish-averages`)
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            const first = data.reduce((a: any, b: any) =>
              new Date(b.date) > new Date(a.date) ? b : a
            )
            setCurrentData({
              region: "Scotland",
              currentLevel: first.current,
              averageLevel: first.current - first.difference_from_average,
              lastUpdated: first.date,
              changeWeek: first.change_from_last_week,
              differenceFromAverage: first.difference_from_average,
            })

            const trendValues = generateTrend(
              first.current,
              first.change_from_last_week
            )
            setSparklineData(trendValues.map((v) => ({ value: v })))

            if (trendValues.length) {
              const highest = Math.max(...trendValues)
              const lowest = Math.min(...trendValues)
              const average =
                trendValues.reduce((a, b) => a + b, 0) / trendValues.length
              setStats({ highest, lowest, average })
            }
          }
        } else {
          const res = await fetch(
            `${API_BASE}/api/water-levels/scottish-regions?area=${encodeURIComponent(region)}`
          )
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            const first = data.reduce((a: any, b: any) =>
              new Date(b.date) > new Date(a.date) ? b : a
            )
            setCurrentData({
              region,
              currentLevel: first.current,
              averageLevel: first.current - first.difference_from_average,
              lastUpdated: first.date,
              changeWeek: first.change_from_last_week,
              differenceFromAverage: first.difference_from_average,
            })

            const trendValues = generateTrend(
              first.current,
              first.change_from_last_week
            )
            setSparklineData(trendValues.map((v) => ({ value: v })))

            if (trendValues.length) {
              const highest = Math.max(...trendValues)
              const lowest = Math.min(...trendValues)
              const average =
                trendValues.reduce((a, b) => a + b, 0) / trendValues.length
              setStats({ highest, lowest, average })
            }
          }
        }
      } catch {
        setCurrentData(null)
        setSparklineData([])
        setStats({ highest: 0, lowest: 0, average: 0 })
      }
    }

    fetchData()
  }, [region])

  const trendMeta = calculateTrendMeta(
    currentData?.currentLevel ?? 0,
    currentData?.changeWeek ?? 0
  )
  const TrendIcon = getTrendIcon(trendMeta.direction)

  const percentage = currentData ? (currentData.currentLevel / 100) * 100 : 0

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Main Level Display */}
      <Card className="lg:col-span-2 shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Current Water Level</CardTitle>
              <p className="text-blue-100">{currentData?.region ?? ""}</p>
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
                  <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                    {currentData ? `${currentData.currentLevel}%` : "-"}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Full</div>
                  <Droplets className="h-6 w-6 text-blue-500 mt-2" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">Capacity: 1.2 billion litres</div>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                  <Calendar className="h-4 w-4" />
                  <span>Updated {currentData ? currentData.lastUpdated : "-"}</span>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Level Statistics</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">vs. Average</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {currentData && currentData.differenceFromAverage > 0 ? "+" : ""}
                        {currentData ? currentData.differenceFromAverage : "-"}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600 dark:text-gray-300">Average Level</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{currentData ? currentData.averageLevel : "-"}%</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">7d Change</div>
                      <div
                        className={`text-lg font-semibold flex items-center ${getTrendColor(trendMeta.direction)}`}
                      >
                        <TrendIcon className="h-4 w-4 mr-1" />
                        {currentData && currentData.changeWeek > 0 ? "+" : ""}
                        {currentData ? currentData.changeWeek : "-"}%
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                          {trendMeta.angle.toFixed(1)}&deg; {trendMeta.direction}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 cb:bg-cbBluishGreen/10 dark:bg-green-900 cb:dark:bg-cbBluishGreen/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">Status</div>
                        <div className="text-lg font-semibold text-green-700 dark:text-green-400 cb:text-cbBluishGreen">
                          {currentData
                            ? currentData.currentLevel >= 90
                              ? "High"
                              : currentData.currentLevel >= 80
                              ? "Normal"
                              : "Low"
                            : "-"}
                        </div>
                      </div>
                      <Badge className="bg-green-600 cb:bg-cbBluishGreen text-white">Operational</Badge>
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
          <p className="text-sm text-gray-600 dark:text-gray-300">Recent water level changes</p>
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
              <span className="text-gray-600 dark:text-gray-300">Highest</span>
              <span className="font-semibold">
                {stats.highest ? `${stats.highest.toFixed(0)}%` : "-"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">Lowest</span>
              <span className="font-semibold">
                {stats.lowest ? `${stats.lowest.toFixed(0)}%` : "-"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">Average</span>
              <span className="font-semibold">
                {stats.average ? `${stats.average.toFixed(0)}%` : "-"}
              </span>
            </div>
          </div>

          {currentData && currentData.currentLevel < 70 && (
            <div className="mt-4 p-3 bg-orange-50 cb:bg-cbOrange/10 dark:bg-orange-900 cb:dark:bg-cbOrange/20 border border-orange-200 dark:border-orange-700 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400 cb:text-cbOrange" />
                <span className="text-sm font-medium text-orange-800 dark:text-orange-200">Below Normal Range</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
