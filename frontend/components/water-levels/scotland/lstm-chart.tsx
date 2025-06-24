"use client";

import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Area,
  ResponsiveContainer,
} from "recharts";
import { Info, TrendingUp, AlertCircle } from "lucide-react";

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
  upperBound?: number;
  lowerBound?: number;
  displayDate: string;
}

const filterByPeriod = (data: ChartPoint[], period: string): ChartPoint[] => {
  if (!data.length) return [];

  let months = 2;
  if (period === "3m") months = 3;
  else if (period === "4m") months = 4;

  let lastRealDate = new Date(data[data.length - 1].date);
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i].actual !== null) {
      lastRealDate = new Date(data[i].date);
      break;
    }
  }
  const start = new Date(lastRealDate);
  start.setMonth(start.getMonth() - (months - 1));
  return data.filter((d) => new Date(d.date) >= start);
};

export function ScottishLSTMChart() {
  const [allData, setAllData] = useState<ChartPoint[]>([]);
  const [period, setPeriod] = useState("2m");
  const [avgPrediction, setAvgPrediction] = useState(0);
  const [trend, setTrend] = useState(0);
  const [showUncertainty, setShowUncertainty] = useState(true);
  const data = useMemo(() => filterByPeriod(allData, period), [allData, period]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [histRes, forecastRes] = await Promise.all([
          fetch(`${API_BASE}/api/water-levels/scottish-averages/`),
          fetch(`${API_BASE}/api/water-levels/scottishwater/LSTM`),
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
              upperBound: Math.min(e.predicted_percentage + 5, 100),
              lowerBound: Math.max(e.predicted_percentage - 5, 0),
              displayDate: new Date(e.date).toLocaleDateString("en-GB", {
                month: "short",
                day: "numeric",
              }),
            });
          });
          const combined = Array.from(map.values()).sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
          );
          setAllData(combined);

          if (forecastData.length) {
            const avg =
              forecastData.reduce((s, d) => s + d.predicted_percentage, 0) /
              forecastData.length;
            setAvgPrediction(avg);
            const tr =
              forecastData[forecastData.length - 1].predicted_percentage -
              forecastData[0].predicted_percentage;
            setTrend(tr);
          }
        }
      } catch {
        setAllData([]);
      }
    };

    fetchData();
  }, []);

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <div className="flex items-center justify-between space-y-4 sm:space-y-0">
          <CardTitle className="text-xl font-bold">Scottish Water Forecast - LSTM</CardTitle>
          <div className="flex items-center space-x-3 sm:ml-4">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2m">2 Months</SelectItem>
                <SelectItem value="3m">3 Months</SelectItem>
                <SelectItem value="4m">4 Months</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={showUncertainty ? "default" : "outline"}
              size="sm"
              onClick={() => setShowUncertainty(!showUncertainty)}
            >
              Uncertainty
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-purple-900 mb-1">AI Model Information</h4>
              <p className="text-sm text-purple-800">
                Forecast generated using an LSTM model trained on historical Severn Trent data.
              </p>
            </div>
          </div>
        </div>

        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="displayDate" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
              <YAxis
                domain={["dataMin - 5", "dataMax + 5"]}
                tick={{ fontSize: 12 }}
                label={{ value: "Water Level (%)", angle: -90, position: "insideLeft" }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
                        <p className="font-semibold text-gray-900">{label}</p>
                        {d.actual && (
                          <p className="text-blue-600">Actual: {d.actual.toFixed(1)}%</p>
                        )}
                        {d.predicted && (
                          <>
                            <p className="text-purple-600">Predicted: {d.predicted.toFixed(1)}%</p>
                            {showUncertainty && (
                              <p className="text-gray-600 text-sm">
                                Range: {d.lowerBound.toFixed(1)}% - {d.upperBound.toFixed(1)}%
                              </p>
                            )}
