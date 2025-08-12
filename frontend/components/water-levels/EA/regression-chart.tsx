"use client";
import { useEffect, useMemo, useState } from "react";
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
import { API_BASE } from "@/lib/api";
import { fetchRegionLevels } from "@/lib/groundwater";
import { parseISO } from "date-fns";

interface ForecastEntry {
  date: string;
  predicted_value: number;
}
interface ChartPoint {
  date: string;
  actual: number | null;
  predicted: number | null;
  upperBound?: number;
  lowerBound?: number;
  displayDate: string;
}

const PERIOD_MONTHS = {
  "9m": { history: 6, forecast: 3 },
  "12m": { history: 9, forecast: 3 },
  "15m": { history: 12, forecast: 3 },
  "18m": { history: 15, forecast: 3 },
};

function filterByPeriod(
  data: ChartPoint[],
  period: string
): { history: ChartPoint[]; forecast: ChartPoint[] } {
  if (!data.length) return { history: [], forecast: [] };
  const { history: historyMonths, forecast: forecastMonths } =
    PERIOD_MONTHS[period] || PERIOD_MONTHS["9m"];

  // Find the last historical (actual) date
  let lastActualIdx = -1;
  for (let i = data.length - 1; i >= 0; i--) {
    if (typeof data[i].actual === "number" && data[i].actual !== null && data[i].actual !== 0) {
      lastActualIdx = i;
      break;
    }
  }
  if (lastActualIdx === -1) return { history: [], forecast: [] };
  const lastActualDate = parseISO(data[lastActualIdx].date);

  // Compute history window start date
  const startHistory = new Date(lastActualDate);
  startHistory.setMonth(startHistory.getMonth() - historyMonths + 1);

  // History: only last X months of actual data up to last actual date
  const history = data
    .filter(
      (d) =>
        typeof d.actual === "number" &&
        d.actual !== null &&
        d.actual !== 0 &&
        parseISO(d.date) >= startHistory &&
        parseISO(d.date) <= lastActualDate
    )
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

  // Forecast: first up to 3 months after last actual date
  const forecastStartIdx = data.findIndex(
    (d) => parseISO(d.date) > lastActualDate && d.predicted !== null
  );
  let forecast: ChartPoint[] = [];
  if (forecastStartIdx !== -1) {
    forecast = data
      .slice(forecastStartIdx)
      .filter((d) => d.predicted !== null)
      .slice(0, forecastMonths * 4); // ~4 points per month (weekly)
  }
  return { history, forecast };
}

export function EARegressionChart({ region }: { region: string }) {
  const [allData, setAllData] = useState<ChartPoint[]>([]);
  const [period, setPeriod] = useState("9m");
  const [avgPrediction, setAvgPrediction] = useState(0);
  const [trend, setTrend] = useState(0);
  const [showUncertainty, setShowUncertainty] = useState(true);

  // --- Clean Break Logic
  const { history: actualSeries, forecast: forecastSeries } = useMemo(
    () => filterByPeriod(allData, period),
    [allData, period]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const start = new Date();
        start.setMonth(start.getMonth() - 18); // always fetch enough for all filters
        const hist = await fetchRegionLevels(region, start.toISOString().split("T")[0]);
        const res = await fetch(
          `${API_BASE}/api/water-levels/groundwater-predictions/?region=${region}&model_type=REGRESSION`
        );
        const forecastData: ForecastEntry[] = await res.json();

        // Combine by date
        const map = new Map<string, ChartPoint>();
        hist.forEach((e) => {
          map.set(e.date, {
            date: e.date,
            actual: e.value,
            predicted: null,
            displayDate: new Date(e.date).toLocaleDateString("en-GB", {
              month: "short",
              day: "numeric",
            }),
          });
        });
        forecastData.forEach((e) => {
          map.set(e.date, {
            date: e.date,
            actual: null,
            predicted: e.predicted_value,
            upperBound: Math.min(e.predicted_value + 5, 100),
            lowerBound: Math.max(e.predicted_value - 5, 0),
            displayDate: new Date(e.date).toLocaleDateString("en-GB", {
              month: "short",
              day: "numeric",
            }),
          });
        });
        const combined = Array.from(map.values()).sort(
          (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()
        );
        setAllData(combined);

        if (forecastData.length) {
          const avg =
            forecastData.reduce((s, d) => s + d.predicted_value, 0) /
            forecastData.length;
          setAvgPrediction(avg);
          const tr =
            forecastData[forecastData.length - 1].predicted_value -
            forecastData[0].predicted_value;
          setTrend(tr);
        }
      } catch {
        setAllData([]);
      }
    };
    fetchData();
  }, [region]);

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <div className="flex items-center justify-between space-y-4 sm:space-y-0">
          <CardTitle className="text-xl font-bold">EA Forecast - Regression</CardTitle>
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
              <h4 className="font-semibold text-purple-900 mb-1">
                AI Model Information
              </h4>
              <p className="text-sm text-purple-800">
                Forecast generated using a regression model.
              </p>
            </div>
          </div>
        </div>
        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={[...actualSeries, ...forecastSeries]}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="displayDate" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
              <YAxis domain={["dataMin - 5", "dataMax + 5"]} tick={{ fontSize: 12 }} label={{ value: "Water Level (%)", angle: -90, position: "insideLeft" }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{label}</p>
                        {d.actual && <p className="text-blue-600">Actual: {d.actual.toFixed(1)}%</p>}
                        {d.predicted && (
                          <>
                            <p className="text-purple-600">Predicted: {d.predicted.toFixed(1)}%</p>
                            {showUncertainty && (
                              <p className="text-gray-600 dark:text-gray-300 text-sm">Range: {d.lowerBound?.toFixed(1)}% - {d.upperBound?.toFixed(1)}%</p>
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
                <Area
                  type="monotone"
                  dataKey="upperBound"
                  stroke="none"
                  fill="#a855f7"
                  fillOpacity={0.1}
                  isAnimationActive={false}
                />
              )}
              {showUncertainty && (
                <Area
                  type="monotone"
                  dataKey="lowerBound"
                  stroke="none"
                  fill="#ffffff"
                  fillOpacity={1}
                  isAnimationActive={false}
                />
              )}
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 4 }}
                connectNulls={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#a855f7"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ r: 4 }}
                connectNulls={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Avg. Predicted Level</span>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600">{avgPrediction.toFixed(1)}%</div>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Trend Direction</span>
              {trend > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400 cb:text-cbBluishGreen" />
              ) : (
                <TrendingUp className="h-4 w-4 text-red-600 dark:text-red-400 cb:text-cbVermillion rotate-180" />
              )}
            </div>
            <div className={`text-2xl font-bold ${trend > 0 ? "text-green-600 dark:text-green-400 cb:text-cbBluishGreen" : "text-red-600 dark:text-red-400 cb:text-cbVermillion"}`}>{trend > 0 ? "+" : ""}{trend.toFixed(1)}%</div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Confidence</span>
              <Badge variant="secondary">High</Badge>
            </div>
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-300">87%</div>
          </div>
        </div>
        {avgPrediction < 70 && (
          <div className="p-4 bg-orange-50 cb:bg-cbOrange/10 dark:bg-orange-900 cb:dark:bg-cbOrange/20 border border-orange-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-500 cb:text-cbOrange mt-0.5" />
              <div>
                <h4 className="font-semibold text-orange-900 mb-1">Low Level Alert</h4>
                <p className="text-sm text-orange-800">Forecasts indicate water levels may drop below normal in the coming weeks.</p>
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-center space-x-6 text-sm mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
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
