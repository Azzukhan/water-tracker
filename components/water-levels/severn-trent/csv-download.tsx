"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface Entry {
  date: string
  percentage: number
}

export function SevernTrentDownload() {
  const [data, setData] = useState<Entry[]>([])

  useEffect(() => {
    fetch("/api/water-levels/severn-trent")
      .then((res) => res.json())
      .then((d) => Array.isArray(d) && setData(d))
      .catch(() => setData([]))
  }, [])

  const handleDownload = () => {
    if (!data.length) return
    const rows = [
      ["Date", "Percentage"],
      ...data.map((e) => [e.date, e.percentage.toString()]),
    ]
    const csvContent = rows.map((r) => r.join(",")).join("\n")
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "severn_trent_reservoir_levels.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          Severn Trent Reservoir Levels
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleDownload} disabled={data.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Download CSV
        </Button>
        {data.length === 0 && (
          <p className="text-sm text-gray-500">No data</p>
        )}
      </CardContent>
    </Card>
  )
}
