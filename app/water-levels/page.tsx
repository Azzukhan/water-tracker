"use client";

import { useEffect, useState } from "react";
import { RegionSelector } from "@/components/water-levels/region-selector";
import { CurrentLevelDisplay } from "@/components/water-levels/current-level-display";
import { HistoryChart } from "@/components/water-levels/history-chart";
import { PredictionChart } from "@/components/water-levels/prediction-chart";
import { DataSources } from "@/components/water-levels/data-sources";
import { ScottishAverageTables } from "@/components/water-levels/scottish-average-tables";
import { SevernTrentDownload } from "@/components/water-levels/severn-trent/data-download";
import { SevernTrentCurrent } from "@/components/water-levels/severn-trent/current";
import { SevernTrentARIMAChart } from "@/components/water-levels/severn-trent/arima-chart";
import { SevernTrentLSTMChart } from "@/components/water-levels/severn-trent/lstm-chart";
import { YorkshireCurrent } from "@/components/water-levels/yorkshire/current";
import { YorkshireReservoirChart } from "@/components/water-levels/yorkshire/chart";
import { Button } from "@/components/ui/button";

export default function WaterLevelsPage() {
  const [agency, setAgency] = useState<"scotland" | "severn_trent" | "yorkshire">(
    "severn_trent",
  );
  const [selectedRegion, setSelectedRegion] = useState("scotland");

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (pos.coords.latitude > 55) setAgency("scotland");
          else setAgency("severn_trent");
        },
        () => setAgency("severn_trent"),
      );
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 space-y-10 mt-24">
      <div className="text-center space-y-2">
        <h1 className="text-4xl lg:text-5xl font-bold">
          UK Water Level Monitoring
        </h1>
        <p className="text-xl text-gray-600">
          Real-time water level data, historical trends, and AI-powered
          predictions across the United Kingdom
        </p>
      </div>
      <div className="flex justify-center space-x-4">
        <Button
          variant={agency === "severn_trent" ? "default" : "outline"}
          onClick={() => setAgency("severn_trent")}
        >
          Severn&nbsp;Trent
        </Button>
        <Button
          variant={agency === "scotland" ? "default" : "outline"}
          onClick={() => setAgency("scotland")}
        >
          Scotland
        </Button>
        <Button
          variant={agency === "yorkshire" ? "default" : "outline"}
          onClick={() => setAgency("yorkshire")}
        >
          Yorkshire
        </Button>
      </div>

      {agency === "scotland" ? (
        <>
          <RegionSelector
            selectedRegion={selectedRegion}
            onSelect={setSelectedRegion}
          />
          <CurrentLevelDisplay region={selectedRegion} />
          <HistoryChart />
          <PredictionChart />
          <DataSources />
          <ScottishAverageTables />
        </>
      ) : agency === "yorkshire" ? (
        <>
          <YorkshireCurrent />
          <YorkshireReservoirChart />
        </>
      ) : (
        <>
          <SevernTrentCurrent />
          <HistoryChart />
          <div className="space-y-6">
            <SevernTrentARIMAChart />
            <SevernTrentLSTMChart />
          </div>
          <SevernTrentDownload />
        </>
      )}
    </div>
  );
}
