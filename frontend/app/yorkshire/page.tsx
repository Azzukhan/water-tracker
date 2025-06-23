"use client";

import { YorkshireCurrent } from "@/components/water-levels/yorkshire/current";
import { YorkshireReservoirChart } from "@/components/water-levels/yorkshire/chart";
import { YorkshireARIMAChart } from "@/components/water-levels/yorkshire/arima-chart";
import { YorkshireLSTMChart } from "@/components/water-levels/yorkshire/lstm-chart";
import { YorkshireRegressionChart } from "@/components/water-levels/yorkshire/regression-chart";
import { YorkshireHistoryChart } from "@/components/water-levels/yorkshire/history-chart";

export default function YorkshirePage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-10 mt-24">
      <div className="text-center space-y-2">
        <h1 className="text-4xl lg:text-5xl font-bold">Yorkshire Water Levels</h1>
        <p className="text-xl text-gray-600">
          Current statistics, historical trends and AI-powered forecasts
        </p>
      </div>
      <YorkshireCurrent />
      <YorkshireHistoryChart />
      <YorkshireReservoirChart />
      <div className="space-y-6">
        <YorkshireARIMAChart />
        <YorkshireLSTMChart />
        <YorkshireRegressionChart />
      </div>
    </div>
  );
}
