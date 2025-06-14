"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Droplets, TrendingDown, Calendar, Download, BarChart3, LineChartIcon } from "lucide-react"

// Generate sample water usage data
const generateWaterUsageData = (period: string) => {
  const data = []
  const now = new Date()
  let days = 30
  let interval = "day"

  switch (period) {
    case "7d":
      days = 7
      interval = "day"
      break
    case "30d":
      days = 30
      interval = "day"
      break
    case "3m":
      days = 90
      interval = "week"
      break
    case "1y":
      days = 365
      interval = "month"
      break
  }

  // Base usage pattern with some randomness
  const baseUsage = 150 // liters per day average
  const weekdayVariation = 20 // weekdays use more water
  const weekendVariation = -30 // weekends use less water
  const seasonalFactor = Math.sin((now.getMonth() / 12) * 2 * Math.PI) * 30 // seasonal variation

  for (let i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    // Calculate usage with variations
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const dayVariation = isWeekend ? weekendVariation : weekdayVariation
    const randomVariation = (Math.random() - 0.5) * 40

    let usage = baseUsage + dayVariation + randomVariation + seasonalFactor
    usage = Math.max(80, Math.min(250, usage)) // Keep within reasonable bounds

    // Calculate average for comparison
    const average = baseUsage + seasonalFactor * 0.5

    // Format date label based on interval
    let displayDate
    if (interval === "day") {
      displayDate = date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    } else if (interval === "week") {
      displayDate = `W${Math.ceil((date.getDate() + date.getDay()) / 7)} ${date.toLocaleDateString("en-GB", { month: "short" })}`
    } else {
      displayDate = date.toLocaleDateString("en-GB", { month: "short", year: "2-digit" })
    }

    data.push({
      date: date.toISOString().split("T")[0],
      usage: Math.round(usage),
      average: Math.round(average),
      displayDate,
    })
  }

  return data
}

export function WaterUsageStats() {
  const [period, setPeriod] = useState("30d")
  const [chartType, setChartType] = useState<"line" | "bar">("line")

  const data = generateWaterUsageData(period)

  // Calculate statistics
  const totalUsage = data.reduce((sum, day) => sum + day.usage, 0)
  const averageUsage = Math.round(totalUsage / data.length)
  const maxUsage = Math.max(...data.map((day) => day.usage))
  const minUsage = Math.min(...data.map((day) => day.usage))
  const nationalAverage = 142 // liters per person per day in UK
  const comparisonToAverage = Math.round(((averageUsage - nationalAverage) / nationalAverage) * 100)

  return (
    <Card className="shadow-lg border-0 dark:border-gray-700 dark:bg-gray-800">
      <CardHeader className="bg-gradient-to-r from-cyan-600 to-teal-600 dark:from-cyan-800 dark:to-teal-800 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <CardTitle className="text-xl font-bold flex items-center">
              <Droplets className="h-5 w-5 mr-2" />
              Water Usage Statistics
            </CardTitle>
            <p className="text-cyan-100">Track and analyze your water consumption</p>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant={chartType === "line" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setChartType("line")}
              className="text-white hover:bg-white/20"
            >
              <LineChartIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={chartType === "bar" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setChartType("bar")}
              className="text-white hover:bg-white/20"
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
                <SelectItem value="3m">3 Months</SelectItem>
                <SelectItem value="1y">1 Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Usage Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average Usage</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{averageUsage}L</div>
            <div className="text-xs text-gray-500 dark:text-gray-500">per day</div>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Usage</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{totalUsage}L</div>
            <div className="text-xs text-gray-500 dark:text-gray-500">this period</div>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Highest Day</div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{maxUsage}L</div>
            <div className="text-xs text-gray-500 dark:text-gray-500">peak usage</div>
          </div>

          <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">vs. UK Average</div>
            <div
              className={`text-2xl font-bold ${comparisonToAverage > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}
            >
              {comparisonToAverage > 0 ? "+" : ""}
              {comparisonToAverage}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">national comparison</div>
          </div>
        </div>

        {/* Usage Chart */}
        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "line" ? (
              <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="displayDate"
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                  className="text-gray-600 dark:text-gray-400"
                />
                <YAxis
                  domain={["auto", "auto"]}
                  tick={{ fontSize: 12 }}
                  label={{
                    value: "Liters",
                    angle: -90,
                    position: "insideLeft",
                    className: "text-gray-600 dark:text-gray-400",
                  }}
                  className="text-gray-600 dark:text-gray-400"
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                          <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
                          <p className="text-blue-600 dark:text-blue-400">Usage: {payload[0].value}L</p>
                          <p className="text-gray-600 dark:text-gray-400">Average: {payload[1].value}L</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="usage"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, fill: "#2563eb" }}
                  name="Your Usage"
                />
                <Line
                  type="monotone"
                  dataKey="average"
                  stroke="#6b7280"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Average"
                />
              </LineChart>
            ) : (
              <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="displayDate"
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                  className="text-gray-600 dark:text-gray-400"
                />
                <YAxis
                  domain={["auto", "auto"]}
                  tick={{ fontSize: 12 }}
                  label={{
                    value: "Liters",
                    angle: -90,
                    position: "insideLeft",
                    className: "text-gray-600 dark:text-gray-400",
                  }}
                  className="text-gray-600 dark:text-gray-400"
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                          <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
                          <p className="text-blue-600 dark:text-blue-400">Usage: {payload[0].value}L</p>
                          <p className="text-gray-600 dark:text-gray-400">Average: {payload[1].value}L</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend />
                <Bar dataKey="usage" fill="#3b82f6" name="Your Usage" />
                <Bar dataKey="average" fill="#9ca3af" name="Average" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Water Saving Tips */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-lg">
          <div className="flex items-start space-x-3">
            <TrendingDown className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-1">Water Saving Tip</h4>
              <p className="text-sm text-blue-800 dark:text-blue-400">
                Fixing a dripping tap can save up to 5,500 liters of water per year. Consider installing water-efficient
                appliances to reduce your usage by up to 30%.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mt-6">
          <Button variant="outline" size="sm" className="text-xs">
            <Calendar className="h-3 w-3 mr-1" />
            Compare Periods
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            <Download className="h-3 w-3 mr-1" />
            Export Data
          </Button>
          <Button size="sm" className="text-xs bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
            <Droplets className="h-3 w-3 mr-1" />
            Water Saving Tips
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
