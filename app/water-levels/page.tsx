"use client"

import { RegionSelector } from "@/components/water-levels/region-selector"
import { CurrentLevelDisplay } from "@/components/water-levels/current-level-display"
import { HistoryChart } from "@/components/water-levels/history-chart"
import { PredictionChart } from "@/components/water-levels/prediction-chart"
import { DataSources } from "@/components/water-levels/data-sources"
import { ScottishResourceTable } from "@/components/water-levels/scottish-resource-table"
import { ScottishAverageTables } from "@/components/water-levels/scottish-average-tables"
import { ScottishLevelSummary } from "@/components/water-levels/scottish-level-summary"

export default function WaterLevelsPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-10 mt-24">
      <div className="text-center space-y-2">
        <h1 className="text-4xl lg:text-5xl font-bold">UK Water Level Monitoring</h1>
        <p className="text-xl text-gray-600">
          Real-time water level data, historical trends, and AI-powered predictions across the United Kingdom
        </p>
      </div>
      <RegionSelector />
      <CurrentLevelDisplay />
      <HistoryChart />
      <PredictionChart />
      <DataSources />
      <ScottishAverageTables />
      <ScottishResourceTable />
      <ScottishLevelSummary />
    </div>
  )
}
