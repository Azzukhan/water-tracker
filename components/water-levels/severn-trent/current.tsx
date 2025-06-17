"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Droplets } from "lucide-react"

interface Entry {
  date: string
  percentage: number
}

export function SevernTrentCurrent() {
  const [latest, setLatest] = useState<Entry | null>(null)

  useEffect(() => {
    fetch("/api/water-levels/severn-trent")
      .then((res) => res.json())
      .then((d: Entry[]) => {
        if (Array.isArray(d) && d.length > 0) setLatest(d[0])
      })
      .catch(() => setLatest(null))
  }, [])

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <CardTitle className="text-2xl font-bold">Severn Trent Reservoir Level</CardTitle>
      </CardHeader>
      <CardContent className="p-8 text-center space-y-4">
        {latest ? (
          <>
            <div className="text-5xl font-bold">{latest.percentage}%</div>
            <div className="text-gray-600">Updated {latest.date}</div>
          </>
        ) : (
          <div className="text-gray-600">No data available</div>
        )}
        <Droplets className="h-8 w-8 text-blue-600 mx-auto" />
      </CardContent>
    </Card>
  )
}
