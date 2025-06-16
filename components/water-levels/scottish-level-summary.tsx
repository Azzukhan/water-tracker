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

interface Level {
  id: number
  date: string
  region: string
  current: string
  change_from_last_week: string
  diff_from_average: string
  source_url: string
}

export function ScottishLevelSummary() {
  const [data, setData] = useState<Level[]>([])

  useEffect(() => {
    fetch("/api/water-levels/scottish-levels")
      .then((res) => res.json())
      .then((d) => {
        if (Array.isArray(d)) {
          setData(d)
        }
      })
      .catch(() => setData([]))
  }, [])

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Scottish Water Levels</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Region</TableHead>
              <TableHead>Current</TableHead>
              <TableHead>Change vs Last Week</TableHead>
              <TableHead>Diff vs Average</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.region}</TableCell>
                <TableCell>{r.current}</TableCell>
                <TableCell>{r.change_from_last_week}</TableCell>
                <TableCell>{r.diff_from_average}</TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
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
  )
}

