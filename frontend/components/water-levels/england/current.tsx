"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Droplets, Calendar, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { calculateTrendMeta } from "@/lib/utils";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { fetchRegionLevels } from "@/lib/groundwater";

interface Props {
  region: string;
}

interface CurrentData {
  currentLevel: number;
  lastUpdated: string;
  averageLevel: number;
  changeWeek: number;
  differenceFromAverage: number;
}

interface TrendPoint {
  value: number;
}

export function EnglandCurrent({ region }: Props) {
  const [currentData, setCurrentData] = useState<CurrentData | null>(null);
  const [sparklineData, setSparklineData] = useState<TrendPoint[]>([]);
  const [stats, setStats] = useState({ highest: 0, lowest: 0, average: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const start = new Date();
        start.setDate(start.getDate() - 7);
        const series = await fetchRegionLevels(
          region,
          start.toISOString().split("T")[0]
        );
        if (series.length) {
          const latest = series[series.length - 1];
          const prev = series[0];
          const avg = series.reduce((a, b) => a + b.value, 0) / series.length;
          const change = +(latest.value - prev.value).toFixed(2);
          const diffAvg = +(latest.value - avg).toFixed(2);
          setCurrentData({
            currentLevel: +latest.value.toFixed(2),
            lastUpdated: latest.date,
            averageLevel: +avg.toFixed(2),
            changeWeek: change,
            differenceFromAverage: diffAvg,
          });
          setSparklineData(series.map((s) => ({ value: s.value })));
          const values = series.map((s) => s.value);
          setStats({
            highest: Math.max(...values),
            lowest: Math.min(...values),
            average: values.reduce((a, b) => a + b, 0) / values.length,
          });
        }
      } catch {
        setCurrentData(null);
        setSparklineData([]);
        setStats({ highest: 0, lowest: 0, average: 0 });
      }
    };
    fetchData();
  }, [region]);

  const trendMeta = calculateTrendMeta(
    currentData?.currentLevel ?? 0,
    currentData?.changeWeek ?? 0
  );
  const TrendIcon =
    trendMeta.direction === "rising"
      ? TrendingUp
      : trendMeta.direction === "falling"
      ? TrendingDown
      : Minus;

  const percentage = currentData ? currentData.currentLevel : 0;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Regional Groundwater Level</CardTitle>
              <p className="text-blue-100 capitalize">{region}</p>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              Live Data
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="relative w-48 h-48 mx-auto mb-6">
                <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${percentage * 2.51} 251`}
                    className="text-blue-600 transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                    {currentData ? `${currentData.currentLevel.toFixed(1)}%` : "-"}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Full</div>
                  <Droplets className="h-6 w-6 text-blue-500 mt-2" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">Capacity: N/A</div>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                  <Calendar className="h-4 w-4" />
                  <span>Updated {currentData ? currentData.lastUpdated : "-"}</span>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Level Statistics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">vs. Average</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {currentData && currentData.differenceFromAverage > 0 ? "+" : ""}
                        {currentData ? currentData.differenceFromAverage.toFixed(1) : "-"}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600 dark:text-gray-300">Average Level</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {currentData ? currentData.averageLevel.toFixed(1) : "-"}%
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">7d Change</div>
                      <div className={`text-lg font-semibold flex items-center ${trendMeta.direction === "rising" ? "text-green-600" : trendMeta.direction === "falling" ? "text-red-600" : "text-gray-600 dark:text-gray-300"}`}>
                        <TrendIcon className="h-4 w-4 mr-1" />
                        {currentData && currentData.changeWeek > 0 ? "+" : ""}
                        {currentData ? currentData.changeWeek.toFixed(1) : "-"}%
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                          {trendMeta.angle.toFixed(1)}&deg; {trendMeta.direction}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">Status</div>
                        <div className="text-lg font-semibold text-green-700">
                          {currentData
                            ? currentData.currentLevel >= 90
                              ? "High"
                              : currentData.currentLevel >= 80
                              ? "Normal"
                              : "Low"
                            : "-"}
                        </div>
                      </div>
                      <Badge className="bg-green-600 text-white">Operational</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">7-Day Trend</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-300">Recent groundwater level changes</p>
        </CardHeader>
        <CardContent>
          <div className="h-32 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">Highest</span>
              <span className="font-semibold">
                {stats.highest ? `${stats.highest.toFixed(1)}%` : "-"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">Lowest</span>
              <span className="font-semibold">
                {stats.lowest ? `${stats.lowest.toFixed(1)}%` : "-"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">Average</span>
              <span className="font-semibold">
                {stats.average ? `${stats.average.toFixed(1)}%` : "-"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
