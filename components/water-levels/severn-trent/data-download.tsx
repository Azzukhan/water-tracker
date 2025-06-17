"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { PDFDocument, StandardFonts } from "pdf-lib"

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

  const handleDownload = async (format: "csv" | "json" | "xml" | "pdf") => {
    if (!data.length) return

    let blob: Blob | null = null
    let filename = "severn_trent_reservoir_levels"

    if (format === "csv") {
      const rows = [
        ["Date", "Percentage"],
        ...data.map((e) => [e.date, e.percentage.toString()]),
      ]
      const csvContent = rows.map((r) => r.join(",")).join("\n")
      blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      filename += ".csv"
    } else if (format === "json") {
      const jsonContent = JSON.stringify(data, null, 2)
      blob = new Blob([jsonContent], { type: "application/json" })
      filename += ".json"
    } else if (format === "xml") {
      const xmlItems = data
        .map((e) => `  <entry>\n    <date>${e.date}</date>\n    <percentage>${e.percentage}</percentage>\n  </entry>`) 
        .join("\n")
      const xmlContent = `<data>\n${xmlItems}\n</data>`
      blob = new Blob([xmlContent], { type: "application/xml" })
      filename += ".xml"
    } else if (format === "pdf") {
      const pdfDoc = await PDFDocument.create()
      const page = pdfDoc.addPage()
      const { width, height } = page.getSize()
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const fontSize = 12
      let y = height - 40
      page.drawText("Severn Trent Reservoir Levels", { x: 40, y, size: 16, font })
      y -= 30
      data.forEach((e) => {
        page.drawText(`${e.date} - ${e.percentage}%`, { x: 40, y, size: fontSize, font })
        y -= fontSize + 4
      })
      const pdfBytes = await pdfDoc.save()
      blob = new Blob([pdfBytes], { type: "application/pdf" })
      filename += ".pdf"
    }

    if (blob) {
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          Severn Trent Reservoir Levels
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button onClick={() => handleDownload("csv")} disabled={data.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button onClick={() => handleDownload("json")} disabled={data.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            JSON
          </Button>
          <Button onClick={() => handleDownload("xml")} disabled={data.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            XML
          </Button>
          <Button onClick={() => handleDownload("pdf")} disabled={data.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
        {data.length === 0 && <p className="text-sm text-gray-500">No data</p>}
      </CardContent>
    </Card>
  )
}
