"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, ResponsiveContainer } from "recharts"
import { ArrowRight } from "lucide-react"
import { calculateTrendMeta } from "@/lib/utils"

interface TrendChartProps {
  currentLevel: number
  changeFromLastWeek: number
}

interface TrendPoint {
  value: number
}

const generateTrend = (current: number, change: number): number[] => {
  const start = current - change
  const step = change / 6
  return Array.from({ length: 7 }, (_, i) => +(start + step * i).toFixed(2))
}

export function TrendChart({
  currentLevel,
  changeFromLastWeek,
}: TrendChartProps) {
  const trendValues = generateTrend(currentLevel, changeFromLastWeek)
  const data: TrendPoint[] = trendValues.map((v) => ({ value: v }))

  const min = Math.min(...trendValues)
  const max = Math.max(...trendValues)
  const avg = trendValues.reduce((a, b) => a + b, 0) / trendValues.length

  const { angle, direction } = calculateTrendMeta(
    currentLevel,
    changeFromLastWeek
  )
  const arrowClass =
    direction === "rising"
      ? "text-green-600"
      : direction === "falling"
      ? "text-red-600"
      : "text-gray-600"

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">7-Day Trend</CardTitle>
        <p className="text-sm text-gray-600">Recent water level changes</p>
      </CardHeader>
      <CardContent>
        <div className="h-32 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
              <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-around text-sm mb-4">
          <div className="text-center">
            <div className="font-semibold">{max.toFixed(0)}%</div>
            <div className="text-gray-600">Max</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">{min.toFixed(0)}%</div>
            <div className="text-gray-600">Min</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">{avg.toFixed(0)}%</div>
            <div className="text-gray-600">Average</div>
          </div>
        </div>

        <div className="flex items-center justify-center text-gray-600 text-sm">
          <ArrowRight
            className={`h-4 w-4 mr-1 ${arrowClass}`}
            style={{ transform: `rotate(${angle}deg)` }}
          />
          <span className="capitalize">{direction}</span>
        </div>
      </CardContent>
    </Card>
  )
}

