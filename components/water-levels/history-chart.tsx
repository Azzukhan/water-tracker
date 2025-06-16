"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { Calendar, Download, ZoomIn, ZoomOut } from "lucide-react"

// Generate sample historical data
const generateHistoricalData = (period: string) => {
  const data = []
  const now = new Date()
  let days = 30

  switch (period) {
    case "1m":
      days = 30
      break
    case "3m":
      days = 90
      break
    case "6m":
      days = 180
      break
    case "1y":
      days = 365
      break
    case "2y":
      days = 730
      break
  }

  for (let i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    // Generate realistic water level data with seasonal variation
    const baseLevel = 75
    const seasonalVariation = Math.sin((date.getMonth() / 12) * 2 * Math.PI) * 15
    const randomVariation = (Math.random() - 0.5) * 10
    const level = Math.max(30, Math.min(100, baseLevel + seasonalVariation + randomVariation))

    data.push({
      date: date.toISOString().split("T")[0],
      level: Math.round(level * 10) / 10,
      average: 82,
      displayDate:
        period === "1m" || period === "3m"
          ? date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
          : date.toLocaleDateString("en-GB", { month: "short", year: "2-digit" }),
    })
  }

  return data
}

export function HistoryChart() {
  const [period, setPeriod] = useState("3m")
  const [zoomLevel, setZoomLevel] = useState(1)

  const [data, setData] = useState(() => generateHistoricalData("3m"))

  useEffect(() => {
    setData(generateHistoricalData(period))
  }, [period])

  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Date,Water Level (%),Average (%)\n" +
      data.map((row) => `${row.date},${row.level},${row.average}`).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `water-levels-${period}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <CardTitle className="text-xl font-bold">Historical Water Levels</CardTitle>
            <p className="text-gray-600">Interactive chart with zoom and pan capabilities</p>
          </div>

          <div className="flex items-center space-x-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">1 Month</SelectItem>
                <SelectItem value="3m">3 Months</SelectItem>
                <SelectItem value="6m">6 Months</SelectItem>
                <SelectItem value="1y">1 Year</SelectItem>
                <SelectItem value="2y">2 Years</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-1">
              <Button variant="outline" size="sm" onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>

            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="displayDate" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
              <YAxis
                domain={["dataMin - 5", "dataMax + 5"]}
                tick={{ fontSize: 12 }}
                label={{ value: "Water Level (%)", angle: -90, position: "insideLeft" }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
                        <p className="font-semibold text-gray-900">{label}</p>
                        <p className="text-blue-600">Current Level: {payload[0].value}%</p>
                        <p className="text-gray-600">Average: {payload[1].value}%</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <ReferenceLine
                y={82}
                stroke="#6b7280"
                strokeDasharray="5 5"
                label={{ value: "Average", position: "topRight" }}
              />
              <Line
                type="monotone"
                dataKey="level"
                stroke="#2563eb"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: "#2563eb" }}
              />
              <Line
                type="monotone"
                dataKey="average"
                stroke="#6b7280"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Chart Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-0.5 bg-blue-600"></div>
              <span>Current Level</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-0.5 bg-gray-600 border-dashed"></div>
              <span>Historical Average</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>
                Data Range: {data[0]?.displayDate} - {data[data.length - 1]?.displayDate}
              </span>
            </div>
            <span>•</span>
            <span>{data.length} data points</span>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {data.length ? Math.max(...data.map((d) => d.level)).toFixed(1) : "0.0"}%
            </div>
            <div className="text-sm text-gray-600">Highest</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {data.length ? Math.min(...data.map((d) => d.level)).toFixed(1) : "0.0"}%
            </div>
            <div className="text-sm text-gray-600">Lowest</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {data.length ? (data.reduce((sum, d) => sum + d.level, 0) / data.length).toFixed(1) : "0.0"}%
            </div>
            <div className="text-sm text-gray-600">Average</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">
              {data.length ? (Math.max(...data.map((d) => d.level)) - Math.min(...data.map((d) => d.level))).toFixed(1) : "0.0"}%
            </div>
            <div className="text-sm text-gray-600">Range</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
