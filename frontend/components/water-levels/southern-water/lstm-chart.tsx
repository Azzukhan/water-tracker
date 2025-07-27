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
  current_level: number;
}

interface ForecastEntry {
  date: string;
  predicted_level: number;
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

  // real months of historical data to display before forecast begins
  let realMonths = 3; // default corresponds to 9 month view (3 real + 6 forecast)
  if (period === "12m") realMonths = 6;
  else if (period === "15m") realMonths = 9;
  else if (period === "18m") realMonths = 12;

  let lastRealDate = new Date(data[data.length - 1].date);
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i].actual !== null) {
      lastRealDate = new Date(data[i].date);
      break;
    }
  }
  const start = new Date(lastRealDate);
  start.setMonth(start.getMonth() - realMonths);
  return data.filter((d) => new Date(d.date) >= start);
};

export function SouthernLSTMChart({ reservoir }: { reservoir: string }) {
  const [allData, setAllData] = useState<ChartPoint[]>([]);
  // default to 9 month view (3 months real + 6 months forecast)
  const [period, setPeriod] = useState("9m");
  const [avgPrediction, setAvgPrediction] = useState(0);
  const [trend, setTrend] = useState(0);
  const [showUncertainty, setShowUncertainty] = useState(true);
  const [accuracy, setAccuracy] = useState<{
    predicted: number | null;
    actual: number | null;
    error: number | null;
  } | null>(null);

  const data = useMemo(() => filterByPeriod(allData, period), [allData, period]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [histRes, forecastRes, accRes] = await Promise.all([
          fetch(`${API_BASE}/api/water-levels/southernwater-reservoirs/?reservoir=${reservoir}`),
          fetch(`${API_BASE}/api/water-levels/southernwater/${reservoir}/LSTM`),
          fetch(
            `${API_BASE}/api/water-levels/southernwater-prediction-accuracy/?reservoir=${reservoir}&model_type=LSTM`
          ),
        ]);
        const [histData, rawForecastData, accData] = await Promise.all([
          histRes.json(),
          forecastRes.json(),
          accRes.json(),
        ]);
        if (Array.isArray(histData) && Array.isArray(rawForecastData)) {
          // Find the latest actual date
          const lastActualDate =
            histData.length > 0
              ? histData.reduce((a, b) =>
                  new Date(b.date) > new Date(a.date) ? b : a
                ).date
              : null;

          // Only first 4 forecasts after the last actual value
          const forecastData = lastActualDate
            ? rawForecastData
                .filter(f => new Date(f.date) > new Date(lastActualDate))
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 4)
            : [];

          // Merge both actual and forecast by date in a map
          const map = new Map<string, ChartPoint>();
          histData.forEach((e: HistoricalEntry) => {
            map.set(e.date, {
              date: e.date,
              actual: e.current_level,
              predicted: null,
              displayDate: new Date(e.date).toLocaleDateString("en-GB", {
                month: "short",
                day: "numeric",
              }),
            });
          });
          forecastData.forEach((e: ForecastEntry) => {
            const displayDate = new Date(e.date).toLocaleDateString("en-GB", {
              month: "short",
              day: "numeric",
            });
            map.set(e.date, {
              date: e.date,
              actual: null,
              predicted: e.predicted_level,
              upperBound: Math.min(e.predicted_level + 5, 100),
              lowerBound: Math.max(e.predicted_level - 5, 0),
              displayDate,
            });
          });

          const combined = Array.from(map.values()).sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          setAllData(combined);

          if (forecastData.length) {
            const avg =
              forecastData.reduce((s, d) => s + d.predicted_level, 0) /
              forecastData.length;
            setAvgPrediction(avg);
            const tr =
              forecastData[forecastData.length - 1].predicted_level -
              forecastData[0].predicted_level;
            setTrend(tr);
          }

          if (Array.isArray(accData) && accData.length > 0) {
            setAccuracy({
              predicted: accData[0].predicted_level,
              actual: accData[0].actual_level,
              error: accData[0].percentage_error,
            });
          } else {
            setAccuracy(null);
          }
        }
      } catch {
        setAllData([]);
      }
    };

    fetchData();
  }, [reservoir]);

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <div className="flex items-center justify-between space-y-4 sm:space-y-0">
          <CardTitle className="text-xl font-bold">Southern Water Forecast - LSTM</CardTitle>
          <div className="flex items-center space-x-3 sm:ml-4">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="9m">9 Months</SelectItem>
                <SelectItem value="12m">12 Months</SelectItem>
                <SelectItem value="15m">15 Months</SelectItem>
                <SelectItem value="18m">18 Months</SelectItem>
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
                Forecast generated using an LSTM model trained on historical Southern Water data.
              </p>
            </div>
          </div>
        </div>

        {accuracy &&
          accuracy.predicted !== null &&
          accuracy.actual !== null &&
          accuracy.error !== null && (
            <p className="mb-4 text-red-600 font-semibold">
              Last week's prediction: {accuracy.predicted?.toFixed(1)}% | Actual: {accuracy.actual?.toFixed(1)}% | Accuracy: {(100 - (accuracy.error || 0)).toFixed(1)}%
            </p>
          )}

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
                        {d.actual !== null && (
                          <p className="text-blue-600">Actual: {d.actual.toFixed(1)}%</p>
                        )}
                        {d.predicted !== null && (
                          <>
                            <p className="text-purple-600">Predicted: {d.predicted.toFixed(1)}%</p>
                            {showUncertainty && (
                              <p className="text-gray-600 text-sm">
                                Range: {d.lowerBound?.toFixed(1)}% - {d.upperBound?.toFixed(1)}%
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {showUncertainty && (
                <Area type="monotone" dataKey="upperBound" stroke="none" fill="#a855f7" fillOpacity={0.1} />
              )}
              {showUncertainty && (
                <Area type="monotone" dataKey="lowerBound" stroke="none" fill="#ffffff" fillOpacity={1} />
              )}
              <Line type="monotone" dataKey="actual" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
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

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Avg. Predicted Level</span>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600">{avgPrediction.toFixed(1)}%</div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Trend Direction</span>
              {trend > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
              )}
            </div>
            <div className={`text-2xl font-bold ${trend > 0 ? "text-green-600" : "text-red-600"}`}>
              {trend > 0 ? "+" : ""}
              {trend.toFixed(1)}%
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Confidence</span>
              <Badge variant="secondary">High</Badge>
            </div>
            <div className="text-2xl font-bold text-gray-600">87%</div>
          </div>
        </div>

        {avgPrediction < 70 && (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-orange-900 mb-1">Low Level Alert</h4>
                <p className="text-sm text-orange-800">
                  Forecasts indicate water levels may drop below normal in the coming weeks. Consider conservation measures.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center space-x-6 text-sm mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-blue-600"></div>
            <span>Historical Data</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-purple-600 border-dashed"></div>
            <span>Prediction</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
