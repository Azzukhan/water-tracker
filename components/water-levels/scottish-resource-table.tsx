"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableHeader,
} from "@/components/ui/table"

interface Resource {
  id: number
  name: string
  level: number
  last_updated: string
}

export function ScottishResourceTable() {
  const [data, setData] = useState<Resource[]>([])

  useEffect(() => {
    fetch("/api/water-levels/scottish-resources")
      .then((res) => res.json())
      .then((d) => {
        if (Array.isArray(d)) {
          setData(d)
        } else {
          setData([])
        }
      })
      .catch(() => setData([]))
  }, [])

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Scottish Water Resources</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Level (%)</TableHead>
              <TableHead>Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.level}</TableCell>
                <TableCell>{r.last_updated}</TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-sm text-gray-500">
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
