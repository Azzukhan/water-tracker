"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Report {
  report_month: string
  rainfall_percent_lta: number
  reservoir_percent: number
  reservoir_weekly_delta: number
  river_condition: string
  demand_megalitres_per_day: number
}

export function YorkshireCurrent() {
  const [report, setReport] = useState<Report | null>(null)

  useEffect(() => {
    fetch("/api/water-levels/yorkshire-water-reports")
      .then((res) => res.json())
      .then((d: Report[]) => Array.isArray(d) && d.length && setReport(d[0]))
      .catch(() => setReport(null))
  }, [])

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Yorkshire Water Report</CardTitle>
      </CardHeader>
      <CardContent>
        {report ? (
          <div className="space-y-2 text-sm">
            <div>Month: {report.report_month}</div>
            <div>Rainfall: {report.rainfall_percent_lta}% LTA</div>
            <div>Reservoir Stock: {report.reservoir_percent}%</div>
            <div>Weekly Change: {report.reservoir_weekly_delta}%</div>
            <div>Demand: {report.demand_megalitres_per_day} Ml/d</div>
            <div>Rivers: {report.river_condition}</div>
          </div>
        ) : (
          <p>No data available</p>
        )}
      </CardContent>
    </Card>
  )
}
