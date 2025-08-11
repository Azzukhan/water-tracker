"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ComposedChart } from "recharts"
import { Brain, TrendingUp, AlertCircle, Info } from "lucide-react"
import { useColorBlind } from "@/components/color-blind-provider"

// Generate AI prediction data
const generatePredictionData = (period: string) => {
  const data = []
  const now = new Date()
  let days = 28

  switch (period) {
    case "4w":
      days = 28
      break
    case "2m":
      days = 60
      break
    case "3m":
      days = 90
      break
  }

  // Historical data (last 7 days)
  for (let i = 7; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    data.push({
      date: date.toISOString().split("T")[0],
      actual: 78 + (Math.random() - 0.5) * 4,
      predicted: null,
      upperBound: null,
      lowerBound: null,
      displayDate: date.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      type: "historical",
    })
  }

  // Prediction data
  for (let i = 1; i <= days; i++) {
    const date = new Date(now)
    date.setDate(date.getDate() + i)

    // Simulate seasonal decline with some recovery
    const trend = -0.1 * i + Math.sin(i / 10) * 2
    const baseLevel = 78 + trend
    const uncertainty = Math.min(5 + i / 7, 15) // Uncertainty increases over time

    data.push({
      date: date.toISOString().split("T")[0],
      actual: null,
      predicted: Math.max(40, Math.min(100, baseLevel)),
      upperBound: Math.max(40, Math.min(100, baseLevel + uncertainty)),
      lowerBound: Math.max(40, Math.min(100, baseLevel - uncertainty)),
      displayDate: date.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      type: "prediction",
    })
  }

  return data
}

export function PredictionChart() {
  const [period, setPeriod] = useState("4w")
  const [showUncertainty, setShowUncertainty] = useState(true)

  const { isColorBlind } = useColorBlind()

  const data = generatePredictionData(period)
  const predictionData = data.filter((d) => d.type === "prediction")
  const avgPrediction = predictionData.reduce((sum, d) => sum + (d.predicted || 0), 0) / predictionData.length
  const trend = predictionData[predictionData.length - 1]?.predicted! - predictionData[0]?.predicted!

  const actualColor = isColorBlind ? "#0072B2" : "#2563eb"
  const predictedColor = isColorBlind ? "#E69F00" : "#a855f7"
  const areaColor = isColorBlind ? "#CC79A7" : "#a855f7"
  const trendColor = isColorBlind ? (trend > 0 ? "#009E73" : "#D55E00") : undefined

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <CardTitle className="text-xl font-bold flex items-center">
              <Brain className="h-5 w-5 mr-2 text-purple-600" />
              AI Water Level Predictions
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300">Machine learning forecasts with uncertainty bands</p>
          </div>

          <div className="flex items-center space-x-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4w">4 Weeks</SelectItem>
                <SelectItem value="2m">2 Months</SelectItem>
                <SelectItem value="3m">3 Months</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={showUncertainty ? "default" : "outline"}
              size="sm"
              onClick={() => setShowUncertainty(!showUncertainty)}
            >
              Uncertainty
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* AI Model Info */}
        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-purple-900 mb-1">AI Model Information</h4>
              <p className="text-sm text-purple-800">
                Predictions generated using ensemble machine learning models trained on 10+ years of historical data,
                weather patterns, and seasonal variations. Confidence intervals show prediction uncertainty.
              </p>
            </div>
          </div>
        </div>

        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                    const data = payload[0].payload
                    return (
                      <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{label}</p>
                        {data.actual && (
                          <p style={{ color: actualColor }}>
                            Actual: {data.actual.toFixed(1)}%
                          </p>
                        )}
                        {data.predicted && (
                          <>
                            <p style={{ color: predictedColor }}>
                              Predicted: {data.predicted.toFixed(1)}%
                            </p>
                            {showUncertainty && (
                              <p className="text-gray-600 dark:text-gray-300 text-sm">
                                Range: {data.lowerBound.toFixed(1)}% - {data.upperBound.toFixed(1)}%
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    )
                  }
                  return null
                }}
              />

              {/* Uncertainty Band */}
              {showUncertainty && (
                <Area type="monotone" dataKey="upperBound" stroke="none" fill={areaColor} fillOpacity={0.1} />
              )}
              {showUncertainty && (
                <Area type="monotone" dataKey="lowerBound" stroke="none" fill="#ffffff" fillOpacity={1} />
              )}

              {/* Actual Data Line */}
              <Line
                type="monotone"
                dataKey="actual"
                stroke={actualColor}
                strokeWidth={3}
                dot={{ fill: actualColor, r: 4 }}
                connectNulls={false}
              />

              {/* Prediction Line */}
              <Line
                type="monotone"
                dataKey="predicted"
                stroke={predictedColor}
                strokeWidth={3}
                strokeDasharray={isColorBlind ? "6 3" : "5 5"}
                dot={{ fill: predictedColor, r: 4 }}
                connectNulls={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Prediction Summary */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Avg. Predicted Level</span>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600">{avgPrediction.toFixed(1)}%</div>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Trend Direction</span>
              {trend > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400 cb:text-cbBluishGreen" />
              ) : (
                <TrendingUp className="h-4 w-4 rotate-180 text-red-600 dark:text-red-400 cb:text-cbVermillion" />
              )}
            </div>
            <div
              className={`text-2xl font-bold ${
                trend > 0
                  ? "text-green-600 dark:text-green-400 cb:text-cbBluishGreen"
                  : "text-red-600 dark:text-red-400 cb:text-cbVermillion"
              }`}
            >
              {trend > 0 ? "+" : ""}
              {trend.toFixed(1)}%
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Confidence</span>
              <Badge variant="secondary">High</Badge>
            </div>
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-300">87%</div>
          </div>
        </div>

        {/* Alerts */}
        {avgPrediction < 70 && (
          <div className="p-4 bg-orange-50 cb:bg-cbOrange/10 dark:bg-orange-900 cb:dark:bg-cbOrange/20 border border-orange-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-500 cb:text-cbOrange mt-0.5" />
              <div>
                <h4 className="font-semibold text-orange-900 mb-1">Low Level Alert</h4>
                <p className="text-sm text-orange-800">
                  AI models predict water levels may drop below normal range in the coming weeks. Consider implementing
                  water conservation measures.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center space-x-6 text-sm mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5" style={{ backgroundColor: actualColor }}></div>
            <span>Historical Data</span>
          </div>
          <div className="flex items-center space-x-2">
            <div
              className="w-4 h-0.5 border-t border-dashed"
              style={{ borderColor: predictedColor }}
            ></div>
            <span>AI Prediction</span>
          </div>
          {showUncertainty && (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-2 opacity-20" style={{ backgroundColor: areaColor }}></div>
              <span>Uncertainty Band</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
