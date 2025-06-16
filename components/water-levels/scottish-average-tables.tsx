"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table"

interface AverageLevel {
  id: number
  date: string
  current: number
  change_from_last_week: number
  difference_from_average: number
}

interface RegionalLevel {
  id: number
  area: string
  date: string
  current: number
  change_from_last_week: number
  difference_from_average: number
}

export function ScottishAverageTables() {
  const [average, setAverage] = useState<AverageLevel | null>(null)
  const [regions, setRegions] = useState<RegionalLevel[]>([])

  useEffect(() => {
    fetch("/api/water-levels/scottish-averages")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAverage(data[0])
        }
      })
      .catch(() => setAverage(null))

    fetch("/api/water-levels/scottish-regions")
      .then((res) => res.json())
      .then((d) => {
        if (Array.isArray(d)) {
          setRegions(d)
        }
      })
      .catch(() => setRegions([]))
  }, [])

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Scotland-wide Average</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Current</TableHead>
                <TableHead>Change vs Last Week</TableHead>
                <TableHead>Diff vs Average</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {average ? (
                <TableRow>
                  <TableCell>{average.date}</TableCell>
                  <TableCell>{average.current}%</TableCell>
                  <TableCell>{average.change_from_last_week}%</TableCell>
                  <TableCell>{average.difference_from_average}%</TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-gray-500">
                    No data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Regional Averages</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Area</TableHead>
                <TableHead>Current</TableHead>
                <TableHead>Change vs Last Week</TableHead>
                <TableHead>Diff vs Average</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {regions.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.area}</TableCell>
                  <TableCell>{r.current}%</TableCell>
                  <TableCell>{r.change_from_last_week}%</TableCell>
                  <TableCell>{r.difference_from_average}%</TableCell>
                </TableRow>
              ))}
              {regions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-gray-500">
                    No data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
