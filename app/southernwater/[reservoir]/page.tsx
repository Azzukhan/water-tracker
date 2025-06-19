"use client";

import { SouthernWaterCurrent } from "@/components/water-levels/southern-water/current";
import { SouthernHistoryChart } from "@/components/water-levels/southern-water/history-chart";
import { SouthernARIMAChart } from "@/components/water-levels/southern-water/arima-chart";
import { SouthernLSTMChart } from "@/components/water-levels/southern-water/lstm-chart";

export default function SouthernReservoirPage({ params }: { params: { reservoir: string } }) {
  const { reservoir } = params;
  return (
    <div className="container mx-auto px-4 py-8 space-y-10 mt-24">
      <div className="text-center space-y-2">
        <h1 className="text-4xl lg:text-5xl font-bold">{reservoir} Reservoir</h1>
        <p className="text-xl text-gray-600">Live levels, history and forecasts</p>
      </div>
      <SouthernWaterCurrent reservoir={reservoir} />
      <SouthernHistoryChart reservoir={reservoir} />
      <div className="space-y-6">
        <SouthernARIMAChart reservoir={reservoir} />
        <SouthernLSTMChart reservoir={reservoir} />
      </div>
    </div>
  );
}
