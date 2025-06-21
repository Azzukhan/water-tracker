"use client"

import { useEffect, useState } from "react"
import { API_BASE } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface ForecastEntry {
  date: string
  predicted_percentage: number
  model_type: string
}

interface ChartPoint {
  date: string
  ARIMA: number | null
  LSTM: number | null
  displayDate: string
}

export function SevernTrentForecastChart() {
  const [data, setData] = useState<ChartPoint[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [arimaRes, lstmRes] = await Promise.all([
          fetch(`${API_BASE}/api/water-levels/severn-trent/ARIMA`),
          fetch(`${API_BASE}/api/water-levels/severn-trent/LSTM`),
        ])
        const [arimaData, lstmData] = await Promise.all([
          arimaRes.json(),
          lstmRes.json(),
        ])
        if (Array.isArray(arimaData) && Array.isArray(lstmData)) {
          const map = new Map<string, ChartPoint>()
          arimaData.forEach((e: ForecastEntry) => {
            map.set(e.date, {
              date: e.date,
              ARIMA: e.predicted_percentage,
              LSTM: null,
              displayDate: new Date(e.date).toLocaleDateString("en-GB", {
                month: "short",
                day: "numeric",
              }),
            })
          })
          lstmData.forEach((e: ForecastEntry) => {
            const existing = map.get(e.date)
            if (existing) {
              existing.LSTM = e.predicted_percentage
            } else {
              map.set(e.date, {
                date: e.date,
                ARIMA: null,
                LSTM: e.predicted_percentage,
                displayDate: new Date(e.date).toLocaleDateString("en-GB", {
                  month: "short",
                  day: "numeric",
                }),
              })
            }
          })
          const combined = Array.from(map.values()).sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          )
          setData(combined)
        }
      } catch (err) {
        setData([])
      }
    }

    fetchData()
  }, [])

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          Severn Trent Forecast (ARIMA vs LSTM)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="displayDate" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
              <YAxis
                domain={["dataMin - 5", "dataMax + 5"]}
                tick={{ fontSize: 12 }}
                label={{ value: "Water Level (%)", angle: -90, position: "insideLeft" }}
              />
              <Tooltip />
              <Line type="monotone" dataKey="ARIMA" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="LSTM" stroke="#a855f7" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
