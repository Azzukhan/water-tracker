"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface HistoricalEntry {
  date: string;
  percentage: number;
}

interface ForecastEntry {
  date: string;
  predicted_percentage: number;
}

interface ChartPoint {
  date: string;
  actual: number | null;
  predicted: number | null;
  displayDate: string;
}

export function SevernTrentLSTMChart() {
  const [data, setData] = useState<ChartPoint[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [histRes, forecastRes] = await Promise.all([
          fetch("/api/water-levels/severn-trent"),
          fetch("/api/water-levels/severn-trent/LSTM"),
        ]);
        const [histData, forecastData] = await Promise.all([
          histRes.json(),
          forecastRes.json(),
        ]);
        if (Array.isArray(histData) && Array.isArray(forecastData)) {
          const map = new Map<string, ChartPoint>();
          histData.forEach((e: HistoricalEntry) => {
            map.set(e.date, {
              date: e.date,
              actual: e.percentage,
              predicted: null,
              displayDate: new Date(e.date).toLocaleDateString("en-GB", {
                month: "short",
                day: "numeric",
              }),
            });
          });
          forecastData.forEach((e: ForecastEntry) => {
            map.set(e.date, {
              date: e.date,
              actual: null,
              predicted: e.predicted_percentage,
              displayDate: new Date(e.date).toLocaleDateString("en-GB", {
                month: "short",
                day: "numeric",
              }),
            });
          });
          const combined = Array.from(map.values()).sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
          );
          setData(combined);
        }
      } catch {
        setData([]);
      }
    };

    fetchData();
  }, []);

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          Severn Trent Forecast - LSTM
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="displayDate"
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={["dataMin - 5", "dataMax + 5"]}
                tick={{ fontSize: 12 }}
                label={{
                  value: "Water Level (%)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#a855f7"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
