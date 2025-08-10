"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getWeatherIcon } from "@/lib/weather-icons";
import { Droplets, Eye, Sun, Wind } from "lucide-react";

interface DailyForecast {
  day: string;
  high: number;
  low: number;
  condition: string;
  icon: string;
}

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  wind_speed: number;
  visibility: number;
  uv_index: number;
  daily: DailyForecast[];
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const DEFAULT = { lat: 51.5074, lon: -0.1278 };

    function fetchWeather(lat: number, lon: number) {
      setLoading(true);
      fetch(`${API_BASE}/api/weather/unified/?latitude=${lat}&longitude=${lon}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch weather");
          return res.json();
        })
        .then((data) => {
          setWeather({
            location: `${data.location.name}, ${data.location.region}`,
            temperature: data.current.temperature,
            condition: data.current.condition,
            icon: data.current.icon,
            humidity: data.current.humidity,
            wind_speed: data.current.wind_speed,
            visibility: data.current.visibility,
            uv_index: data.current.uv_index,
            daily: (data.daily || [])
              .slice(0, 4)
              .map((day: any, idx: number) => ({
                day:
                  idx === 0
                    ? "Today"
                    : new Date(day.date).toLocaleDateString("en-US", {
                        weekday: "long",
                      }),
                high: day.high ?? day.temperature_max,
                low: day.low ?? day.temperature_min,
                condition: day.condition,
                icon: day.icon,
              })),
          });
          setError(null);
        })
        .catch((err) => {
          console.error(err);
          setError("Failed to load weather data");
        })
        .finally(() => setLoading(false));
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchWeather(pos.coords.latitude, pos.coords.longitude);
        },
        () => fetchWeather(DEFAULT.lat, DEFAULT.lon),
      );
    } else {
      fetchWeather(DEFAULT.lat, DEFAULT.lon);
    }
  }, []);

  if (loading) {
    return (
      <Card className="shadow border-gray-100 dark:border-gray-700">
        <CardContent className="p-6 text-center">
          Loading weather...
        </CardContent>
      </Card>
    );
  }

  if (error || !weather) {
    return (
      <Card className="shadow border-gray-100 dark:border-gray-700">
        <CardContent className="p-6 text-center text-destructive">
          {error || "No weather data"}
        </CardContent>
      </Card>
    );
  }

  const WeatherIcon = getWeatherIcon(weather.icon);

  return (
    <Card className="shadow-lg border-0 h-full flex flex-col">
      <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-500 dark:from-cyan-700 dark:to-blue-700 text-white h-24 flex flex-col justify-center rounded-t-lg">
        <CardTitle className="flex items-center justify-between text-xl">
          <span>Current Weather</span>
          <Badge variant="secondary" className="flex items-center gap-1 bg-white/20 text-white border-white/30">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Live
          </Badge>
        </CardTitle>
        <p className="text-sm text-cyan-100 dark:text-cyan-200">{weather.location}</p>
      </CardHeader>
      <CardContent className="p-6 flex flex-col flex-1">
        <div className="flex-1">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <WeatherIcon className="h-16 w-16 text-blue-500 dark:text-blue-400" />
            </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold text-gray-900 dark:text-white">
              {Math.round(weather.temperature)}°C
            </div>
            <div className="text-lg text-gray-600 dark:text-gray-300">{weather.condition}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 text-center">
            <Droplets className="h-6 w-6 text-blue-500 dark:text-blue-400 mx-auto mb-2" />
            <div className="text-sm text-gray-600 dark:text-gray-300">Humidity</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">{Math.round(weather.humidity)}%</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4 text-center">
            <Wind className="h-6 w-6 text-green-500 dark:text-green-400 mx-auto mb-2" />
            <div className="text-sm text-gray-600 dark:text-gray-300">Wind</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">{Math.round(weather.wind_speed)} mph</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900 rounded-lg p-4 text-center">
            <Eye className="h-6 w-6 text-orange-500 dark:text-orange-400 mx-auto mb-2" />
            <div className="text-sm text-gray-600 dark:text-gray-300">Visibility</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">{Math.round(weather.visibility)} km</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900 rounded-lg p-4 text-center">
            <Sun className="h-6 w-6 text-red-500 dark:text-red-400 mx-auto mb-2" />
            <div className="text-sm text-gray-600 dark:text-gray-300">UV Index</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">{Math.round(weather.uv_index)}</div>
          </div>
        </div>
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-center">4-Day Forecast</h3>
          <div className="flex flex-col gap-3">
            {weather.daily.slice(0, 4).map((d, idx) => {
              const Icon = getWeatherIcon(d.icon);
              return (
                <div
                  key={idx}
                  className="
                    grid
                    grid-cols-[7rem,1fr,3.5rem]
                    items-center
                    px-4 py-3
                    min-h-[48px]
                    rounded-xl
                    bg-white dark:bg-gray-800
                    shadow-sm
                    border border-gray-100 dark:border-gray-700
                  "
                >
                  {/* Icon and day (fixed width column) */}
                  <div className="flex items-center gap-2 w-28">
                    <Icon className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                    <span className="font-medium text-gray-900 dark:text-white">{d.day}</span>
                  </div>
                  {/* Condition (middle column) */}
                  <div className="pl-4 text-gray-600 dark:text-gray-300 text-sm">{d.condition}</div>
                  {/* Temps (fixed width column, right-aligned) */}
                  <div className="flex items-baseline justify-end gap-1 font-semibold text-gray-900 dark:text-white text-lg">
                    {Math.round(d.high)}°
                    <span className="text-gray-400 dark:text-gray-500 text-base font-normal ml-1">{Math.round(d.low)}°</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        </div>
        <Button className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600" asChild>
          <Link href="/weather">
            Check Full Weather Report
            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="M12 5l7 7-7 7" />
            </svg>
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
