"use client";

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

interface Entry {
  report_date: string;
  reservoir_level: number;
  weekly_difference: number | null;
  direction: string;
}

export function YorkshireReservoirChart() {
  const [dataPoints, setDataPoints] = useState<Entry[]>([]);

  useEffect(() => {
    fetch("/api/water-levels/yorkshire/reservoir-data/")
      .then((res) => res.json())
      .then((d: Entry[]) => Array.isArray(d) && setDataPoints(d.reverse()))
      .catch(() => setDataPoints([]));
  }, []);

  const chartData = {
    labels: dataPoints.map((d) =>
      new Date(d.report_date).toLocaleDateString("en-GB", {
        month: "short",
        year: "numeric",
      })
    ),
    datasets: [
      {
        label: "Reservoir Stock %",
        data: dataPoints.map((d) => d.reservoir_level),
        borderColor: "rgb(37,99,235)",
        backgroundColor: "rgba(37,99,235,0.5)",
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true, max: 100 },
    },
  };

  return (
    <div className="w-full h-80">
      <Line data={chartData} options={options} />
    </div>
  );
}
