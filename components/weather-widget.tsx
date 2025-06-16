"use client";

import { useEffect, useState } from "react";
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
      fetch(`/api/weather/unified/?latitude=${lat}&longitude=${lon}`)
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
      <Card className="shadow border-gray-100">
        <CardContent className="p-6 text-center">
          Loading weather...
        </CardContent>
      </Card>
    );
  }

  if (error || !weather) {
    return (
      <Card className="shadow border-gray-100">
        <CardContent className="p-6 text-center text-destructive">
          {error || "No weather data"}
        </CardContent>
      </Card>
    );
  }

  const WeatherIcon = getWeatherIcon(weather.icon);

  return (
    <Card className="shadow border-gray-100">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-xl">
          <span>Current Weather</span>
          <Badge variant="secondary" className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live
          </Badge>
        </CardTitle>
        <p className="text-sm text-gray-500">{weather.location}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <WeatherIcon className="h-12 w-12 text-blue-500" />
          <div>
            <div className="text-3xl font-bold">
              {Math.round(weather.temperature)}°C
            </div>
            <div className="text-gray-600">{weather.condition}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-blue-500" />
            <span>Humidity</span>
            <span className="ml-auto font-medium">
              {Math.round(weather.humidity)}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-blue-500" />
            <span>Wind</span>
            <span className="ml-auto font-medium">
              {Math.round(weather.wind_speed)} mph
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-blue-500" />
            <span>Visibility</span>
            <span className="ml-auto font-medium">
              {Math.round(weather.visibility)} km
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-blue-500" />
            <span>UV Index</span>
            <span className="ml-auto font-medium">
              {Math.round(weather.uv_index)}
            </span>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">4-Day Forecast</h3>
          <div className="space-y-1">
            {weather.daily.map((d, idx) => {
              const Icon = getWeatherIcon(d.icon);
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-blue-500" />
                    <span>{d.day}</span>
                  </div>
                  <div className="flex items-center gap-1 font-medium">
                    <span>{Math.round(d.high)}°</span>
                    <span className="text-gray-500">{Math.round(d.low)}°</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
          <Link href="/weather">Check Full Weather Report</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
