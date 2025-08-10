"use client";

import { useEffect, useState } from "react";
import { RegionSelector } from "@/components/water-levels/region-selector";
import { CurrentLevelDisplay } from "@/components/water-levels/current-level-display";
import { HistoryChart } from "@/components/water-levels/history-chart";
import { PredictionChart } from "@/components/water-levels/prediction-chart";
import { DataSources } from "@/components/water-levels/data-sources";
import { ScottishAverageTables } from "@/components/water-levels/scottish-average-tables";
import { ScottishHistoryChart } from "@/components/water-levels/scotland/history-chart";
import { ScottishARIMAChart } from "@/components/water-levels/scotland/arima-chart";
import { ScottishLSTMChart } from "@/components/water-levels/scotland/lstm-chart";
import { ScottishRegressionChart } from "@/components/water-levels/scotland/regression-chart";
import { ScottishRegionalHistoryChart } from "@/components/water-levels/scotland/regional/history-chart";
import { ScottishRegionalARIMAChart } from "@/components/water-levels/scotland/regional/arima-chart";
import { ScottishRegionalLSTMChart } from "@/components/water-levels/scotland/regional/lstm-chart";
import { ScottishRegionalRegressionChart } from "@/components/water-levels/scotland/regional/regression-chart";
import { SevernTrentDownload } from "@/components/water-levels/severn-trent/data-download";
import { SevernTrentCurrent } from "@/components/water-levels/severn-trent/current";
import { SevernTrentARIMAChart } from "@/components/water-levels/severn-trent/arima-chart";
import { SevernTrentLSTMChart } from "@/components/water-levels/severn-trent/lstm-chart";
import { SevernTrentRegressionChart } from "@/components/water-levels/severn-trent/regression-chart";
import { YorkshireCurrent } from "@/components/water-levels/yorkshire/current";
import { YorkshireHistoryChart } from "@/components/water-levels/yorkshire/history-chart";
import { YorkshireARIMAChart } from "@/components/water-levels/yorkshire/arima-chart";
import { YorkshireLSTMChart } from "@/components/water-levels/yorkshire/lstm-chart";
import { YorkshireRegressionChart } from "@/components/water-levels/yorkshire/regression-chart";
import { SouthernWaterReservoirSelector } from "@/components/water-levels/southern-water/reservoir-selector";
import { SouthernWaterCurrent } from "@/components/water-levels/southern-water/current";
import { SouthernHistoryChart } from "@/components/water-levels/southern-water/history-chart";
import { SouthernARIMAChart } from "@/components/water-levels/southern-water/arima-chart";
import { SouthernLSTMChart } from "@/components/water-levels/southern-water/lstm-chart";
import { SouthernRegressionChart } from "@/components/water-levels/southern-water/regression-chart";
import { EnglandRegionSelector } from "@/components/water-levels/england/region-selector";
import { EnglandCurrent } from "@/components/water-levels/england/current";
import { EnglandHistoryChart } from "@/components/water-levels/england/history-chart";
import { EnglandARIMAChart } from "@/components/water-levels/england/arima-chart";
import { EnglandLSTMChart } from "@/components/water-levels/england/lstm-chart";
import { EnglandRegressionChart } from "@/components/water-levels/england/regression-chart";
import { Button } from "@/components/ui/button";

export default function WaterLevelsPage() {
  const [agency, setAgency] = useState<
    "scotland" | "severn_trent" | "yorkshire" | "southern_water" | "england"
  >("severn_trent");
  const [selectedRegion, setSelectedRegion] = useState("scotland");
  const [englandRegion, setEnglandRegion] = useState("north");
  const [southernReservoir, setSouthernReservoir] = useState("Bewl");

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
        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100">
          UK Water Level Monitoring
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
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
        <Button
          variant={agency === "southern_water" ? "default" : "outline"}
          onClick={() => setAgency("southern_water")}
        >
          Southern&nbsp;Water
        </Button>
        <Button
          variant={agency === "england" ? "default" : "outline"}
          onClick={() => setAgency("england")}
        >
          England
        </Button>
      </div>

      {agency === "scotland" ? (
        <>
          <RegionSelector
            selectedRegion={selectedRegion}
            onSelect={setSelectedRegion}
          />
          <CurrentLevelDisplay region={selectedRegion} />
          {selectedRegion === "scotland" ? (
            <>
              <ScottishHistoryChart />
              <div className="space-y-6">
                <ScottishARIMAChart />
                <ScottishLSTMChart />
                <ScottishRegressionChart />
              </div>
            </>
          ) : (
            <>
              <ScottishRegionalHistoryChart area={selectedRegion} />
              <div className="space-y-6">
                <ScottishRegionalARIMAChart area={selectedRegion} />
                <ScottishRegionalLSTMChart area={selectedRegion} />
                <ScottishRegionalRegressionChart area={selectedRegion} />
              </div>
            </>
          )}
        </>
      ) : agency === "yorkshire" ? (
        <>
          <YorkshireCurrent />
          <YorkshireHistoryChart />
          <div className="space-y-6">
            <YorkshireARIMAChart />
            <YorkshireLSTMChart />
            <YorkshireRegressionChart />
          </div>
        </>
      ) : agency === "southern_water" ? (
        <>
          <SouthernWaterReservoirSelector
            selectedReservoir={southernReservoir}
            onSelect={setSouthernReservoir}
          />
          <SouthernWaterCurrent reservoir={southernReservoir} />
          <SouthernHistoryChart reservoir={southernReservoir} />
          <div className="space-y-6">
            <SouthernARIMAChart reservoir={southernReservoir} />
            <SouthernLSTMChart reservoir={southernReservoir} />
            <SouthernRegressionChart reservoir={southernReservoir} />
          </div>
        </>
      ) : agency === "england" ? (
        <>
          <EnglandRegionSelector region={englandRegion} onSelect={setEnglandRegion} />
          <EnglandCurrent region={englandRegion} />
          <EnglandHistoryChart region={englandRegion} />
          <div className="space-y-6">
            <EnglandARIMAChart region={englandRegion} />
            <EnglandLSTMChart region={englandRegion} />
            <EnglandRegressionChart region={englandRegion} />
          </div>
        </>
      ) : (
        <>
          <SevernTrentCurrent />
          <HistoryChart />
          <div className="space-y-6">
            <SevernTrentARIMAChart />
            <SevernTrentLSTMChart />
            <SevernTrentRegressionChart />
          </div>
        </>
      )}
    </div>
  );
}
