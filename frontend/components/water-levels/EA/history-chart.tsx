"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Calendar, Download, ZoomIn, ZoomOut } from "lucide-react";
import { fetchRegionLevels } from "@/lib/groundwater";

interface ChartPoint {
  date: string;
  level: number;
  displayDate: string;
  average: number;
}

const filterByPeriod = (data: ChartPoint[], period: string): ChartPoint[] => {
  if (!data.length) return [];
  let days = 30;
  switch (period) {
    case "1m":
      days = 30;
      break;
    case "3m":
      days = 90;
      break;
    case "6m":
      days = 180;
      break;
    case "1y":
      days = 365;
      break;
    case "2y":
      days = 730;
      break;
  }
  const lastDate = new Date(data[data.length - 1].date);
  const start = new Date(lastDate);
  start.setDate(start.getDate() - days);
  return data.filter((d) => new Date(d.date) >= start);
};

export function EAHistoryChart({ region }: { region: string }) {
  const [period, setPeriod] = useState("3m");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [allData, setAllData] = useState<ChartPoint[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const start = new Date();
        start.setDate(start.getDate() - 730);
        const series = await fetchRegionLevels(
          region,
          start.toISOString().split("T")[0]
        );
        if (series.length) {
          const avg = series.reduce((s, d) => s + d.value, 0) / series.length;
          const mapped = series.map((s) => ({
            date: s.date,
            level: s.value,
            average: avg,
            displayDate: new Date(s.date).toLocaleDateString("en-GB", {
              month: "short",
              day: "numeric",
            }),
          }));
          setAllData(mapped);
        }
      } catch {
        setAllData([]);
      }
    };
    fetchData();
  }, [region]);

  const data = useMemo(() => filterByPeriod(allData, period), [allData, period]);

  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Date,Water Level (%)\n" +
      data.map((row) => `${row.date},${row.level}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `groundwater-levels-${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <CardTitle className="text-xl font-bold">Historical EA Stations Water Levels</CardTitle>
            <p className="text-gray-600 dark:text-gray-300">Interactive chart with zoom and export</p>
          </div>
          <div className="flex items-center space-x-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">1 Month</SelectItem>
                <SelectItem value="3m">3 Months</SelectItem>
                <SelectItem value="6m">6 Months</SelectItem>
                <SelectItem value="1y">1 Year</SelectItem>
                <SelectItem value="2y">2 Years</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-1">
              <Button variant="outline" size="sm" onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="displayDate" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
              <YAxis domain={["dataMin - 5", "dataMax + 5"]} tick={{ fontSize: 12 }} label={{ value: "Water Level (%)", angle: -90, position: "insideLeft" }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{label}</p>
                        <p className="text-blue-600">Level: {payload[0].value.toFixed(1)}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={allData.length ? allData[0].average : 0} stroke="#6b7280" strokeDasharray="5 5" label={{ value: "Average", position: "topRight" }} />
              <Line type="monotone" dataKey="level" stroke="#2563eb" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: "#2563eb" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-blue-600"></div>
            <span>Level</span>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>
                Data Range: {data[0]?.displayDate} - {data[data.length - 1]?.displayDate}
              </span>
            </div>
            <span>•</span>
            <span>{data.length} data points</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
