"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import { useColorBlind } from "@/components/color-blind-provider";

interface Entry {
  report_date: string;
  reservoir_level: number;
  weekly_difference: number | null;
  direction: string;
}

export function YorkshireReservoirChart() {
  const [dataPoints, setDataPoints] = useState<Entry[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/water-levels/yorkshire/reservoir-data/`)
      .then((res) => res.json())
      .then((d: Entry[]) => Array.isArray(d) && setDataPoints(d.reverse()))
      .catch(() => setDataPoints([]));
  }, []);

  const { colorBlind } = useColorBlind();

  const border = colorBlind ? "#0072B2" : "rgb(37,99,235)";
  const background = colorBlind ? "rgba(0,114,178,0.5)" : "rgba(37,99,235,0.5)";
  const dash = colorBlind ? [6, 3] : [];
  const pointStyle = colorBlind ? "triangle" : "circle";

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
        borderColor: border,
        backgroundColor: background,
        borderDash: dash,
        pointStyle,
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
