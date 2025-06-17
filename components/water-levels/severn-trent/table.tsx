"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Entry {
  date: string
  percentage: number
}

export function SevernTrentTable() {
  const [data, setData] = useState<Entry[]>([])

  useEffect(() => {
    fetch("/api/water-levels/severn-trent")
      .then((res) => res.json())
      .then((d) => Array.isArray(d) && setData(d))
      .catch(() => setData([]))
  }, [])

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Severn Trent Reservoir Levels</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Percentage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((e) => (
              <TableRow key={e.date}>
                <TableCell>{e.date}</TableCell>
                <TableCell className="text-right">{e.percentage}%</TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-sm text-gray-500">
                  No data
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
