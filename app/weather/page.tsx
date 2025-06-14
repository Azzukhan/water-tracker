"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Cloud,
  CloudRain,
  Sun,
  Wind,
  Droplets,
  Eye,
  Thermometer,
  MapPin,
  LocateFixed,
  RefreshCw,
  Sunrise,
  Sunset,
  Moon,
  CloudLightning,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LocationInput } from "@/components/weather/location-input";
import { CurrentConditions } from "@/components/weather/current-conditions";
import { ForecastSection } from "@/components/weather/forecast-section";
import { RainRadar } from "@/components/weather/rain-radar";
import { SunriseSunset } from "@/components/weather/sunrise-sunset";
import { AirQuality } from "@/components/weather/air-quality";
import { Header } from "@/components/header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HourlyForecast } from "@/components/weather/hourly-forecast";

interface Location {
  name: string;
  lat: number;
  lon: number;
}

interface WeatherData {
  station: {
    name: string;
    region: string;
  };
  location: {
    lat: number;
    lon: number;
  };
  temperature: number;
  feels_like: number;
  condition: string;
  description: string;
  humidity: number;
  wind_speed: number;
  wind_direction: string;
  visibility: number;
  pressure: number;
  uv_index: number;
  icon: string;
  last_updated: string;
  hourly: Array<{
    time: string;
    temperature: number;
    condition: string;
    icon: string;
    precipitation_probability: number;
    wind_speed: number;
    wind_direction: string;
  }>;
  daily: Array<{
    date: string;
    day: string;
    high: number;
    low: number;
    condition: string;
    description: string;
    icon: string;
    precipitation: number;
    humidity: number;
    wind_speed: number;
    wind_direction: string;
    uv_index: number;
    temperature_max?: number;
    temperature_min?: number;
  }>;
  sun: {
    sunrise?: string;
    sunset?: string;
    day_length?: string;
  };
  moon: {
    rise?: string;
    set?: string;
    phase?: string;
  };
  aqi: {
    value?: number;
    status?: string;
    pollutants?: Array<{ name: string; value: number; unit: string }>;
    forecast?: Array<{ day: string; aqi: number; status: string }>;
  };
}

const DEFAULT_LOCATION: Location = {
  name: "London, England",
  lat: 51.5074,
  lon: -0.1278,
};

export default function WeatherPage() {
  const [location, setLocation] = useState<Location | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [lastGoodWeather, setLastGoodWeather] = useState<WeatherData | null>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let didCancel = false;
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          if (didCancel) return;
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `/api/weather/geocode?latitude=${latitude}&longitude=${longitude}`
            );
            const data = await response.json();
            if (data.locations && data.locations.length > 0) {
              setLocation(data.locations[0]);
            } else {
              setLocation({
                name: "Current Location",
                lat: latitude,
                lon: longitude,
              });
            }
          } catch {
            setLocation({
              name: "Current Location",
              lat: latitude,
              lon: longitude,
            });
          }
        },
        () => {
          if (!didCancel) setLocation(DEFAULT_LOCATION);
        }
      );
    } else {
      setLocation(DEFAULT_LOCATION);
    }
    return () => {
      didCancel = true;
    };
  }, []);

  useEffect(() => {
    if (!location) return;
    fetchWeather(location);
  }, [location]);

  useEffect(() => {
    if (!location) return;
    const id = setInterval(() => {
      fetchWeather(location);
    }, 5 * 60 * 1000); // refresh every 5 minutes
    return () => clearInterval(id);
  }, [location]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [showDropdown]);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    setSearchLoading(true);
    setSearchError(null);
    searchTimeout.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/weather/geocode?q=${encodeURIComponent(searchQuery)}`
        );
        const data = await response.json();
        setSearchResults(data.locations || []);
        setShowDropdown(true);
        setSearchLoading(false);
      } catch {
        setSearchError("Failed to search locations.");
        setSearchLoading(false);
      }
    }, 400);
  }, [searchQuery]);

  async function fetchWeather(loc: Location, retry = 0) {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/weather/unified/?latitude=${loc.lat}&longitude=${loc.lon}`
      );
      if (!response.ok) throw new Error("Failed to fetch weather data");
      const data = await response.json();
      const transformed: WeatherData = {
        station: {
          name: data.location.name,
          region: data.location.region || "UK",
        },
        location: {
          lat: data.location.lat,
          lon: data.location.lon,
        },
        temperature: data.current.temperature,
        feels_like: data.current.feels_like,
        condition: data.current.condition,
        description: data.current.condition,
        humidity: data.current.humidity,
        wind_speed: data.current.wind_speed,
        wind_direction: data.current.wind_direction,
        visibility: data.current.visibility,
        pressure: data.current.pressure,
        uv_index: data.current.uv_index,
        icon: data.current.icon,
        last_updated: data.current.timestamp,
        hourly: (data.hourly || []).map((hour: any) => ({
          time: hour.time,
          temperature: hour.temperature,
          condition: hour.condition,
          icon: hour.icon,
          precipitation_probability: hour.precipitation_probability,
          wind_speed: hour.wind_speed,
          wind_direction: hour.wind_direction,
        })),
        daily: data.daily.map((day: any) => ({
          date: day.date,
          day: new Date(day.date).toLocaleDateString("en-US", {
            weekday: "long",
          }),
          high: day.high,
          low: day.low,
          condition: day.condition,
          description: day.description,
          icon: day.icon,
          precipitation: day.precipitation,
          humidity: day.humidity,
          wind_speed: day.wind_speed,
          wind_direction: day.wind_direction,
          uv_index: day.uv_index,
          temperature_max: day.high,
          temperature_min: day.low,
        })),
        sun: {
          sunrise: data.sun?.sunrise,
          sunset: data.sun?.sunset,
          day_length: data.sun?.day_length,
        },
        moon: {
          rise: data.moon?.rise,
          set: data.moon?.set,
          phase: data.moon?.phase,
        },
        aqi: {
          value: data.aqi?.value,
          status: data.aqi?.status,
          pollutants: data.aqi?.pollutants || [],
          forecast: data.aqi?.forecast || [],
        },
      };
      setWeatherData(transformed);
      setLastGoodWeather(transformed);
    } catch (err) {
      if (retry < 1) {
        setTimeout(() => fetchWeather(loc, retry + 1), 1000);
      } else {
        setError("Failed to fetch weather data. Please try again.");
        if (lastGoodWeather) setWeatherData(lastGoodWeather);
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading)
    return <div className="text-center py-20 text-xl">Loading...</div>;
  if (error)
    return (
      <div className="text-center py-20 text-xl text-red-500">{error}</div>
    );
  if (!weatherData)
    return (
      <div className="text-center py-20 text-xl">
        No weather data available.
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <Header />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              UK Weather Report
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive weather data, forecasts, and environmental
              conditions across the United Kingdom
            </p>
          </div>
          {/* Location Input */}
          <div className="mb-8 relative">
            <h1 className="text-3xl font-bold mb-4">Weather Forecast</h1>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="flex flex-row gap-2">
                  <Input
                    type="text"
                    placeholder="Search for a location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
                    onFocus={() =>
                      searchResults.length > 0 && setShowDropdown(true)
                    }
                    onKeyDown={async (e) => {
                      if (e.key === "Enter" && searchQuery.trim().length > 0) {
                        setSearchLoading(true);
                        setSearchError(null);
                        try {
                          const response = await fetch(
                            `/api/weather/geocode?q=${encodeURIComponent(searchQuery)}`
                          );
                          const data = await response.json();
                          if (data.locations && data.locations.length > 0) {
                            setLocation(data.locations[0]);
                            setShowDropdown(false);
                            setSearchQuery("");
                          } else {
                            setSearchError("Location not found.");
                          }
                        } catch {
                          setSearchError("Failed to search locations.");
                        } finally {
                          setSearchLoading(false);
                        }
                      }
                    }}
                  />
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={async () => {
                      if (searchQuery.trim().length > 0) {
                        setSearchLoading(true);
                        setSearchError(null);
                        try {
                          const response = await fetch(
                            `/api/weather/geocode?q=${encodeURIComponent(searchQuery)}`
                          );
                          const data = await response.json();
                          if (data.locations && data.locations.length > 0) {
                            setLocation(data.locations[0]);
                            setShowDropdown(false);
                            setSearchQuery("");
                          } else {
                            setSearchError("Location not found.");
                          }
                        } catch {
                          setSearchError("Failed to search locations.");
                        } finally {
                          setSearchLoading(false);
                        }
                      }
                    }}
                    disabled={searchLoading || !searchQuery.trim()}
                  >
                    {searchLoading ? "Searching..." : "Search"}
                  </Button>
                </div>
                {/* Dropdown */}
                {showDropdown && (
                  <div
                    ref={dropdownRef}
                    className="absolute z-20 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-y-auto border border-gray-200"
                  >
                    {searchResults.length === 0 && !searchLoading ? (
                      <div className="p-2 text-gray-500">No results found.</div>
                    ) : (
                      searchResults.map((loc) => (
                        <div
                          key={`${loc.lat}-${loc.lon}`}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setLocation(loc);
                            setShowDropdown(false);
                            setSearchQuery("");
                          }}
                        >
                          {loc.name}
                        </div>
                      ))
                    )}
                  </div>
                )}
                {searchError && (
                  <div className="text-red-500 text-sm mt-1">{searchError}</div>
                )}
              </div>
              <Button
                variant="outline"
                className="border-blue-300"
                onClick={() => {
                  if ("geolocation" in navigator) {
                    navigator.geolocation.getCurrentPosition(
                      async (position) => {
                        const { latitude, longitude } = position.coords;
                        try {
                          const response = await fetch(
                            `/api/weather/geocode?latitude=${latitude}&longitude=${longitude}`
                          );
                          const data = await response.json();
                          if (data.locations && data.locations.length > 0) {
                            setLocation(data.locations[0]);
                          } else {
                            setLocation({
                              name: "Current Location",
                              lat: latitude,
                              lon: longitude,
                            });
                          }
                        } catch {
                          setLocation({
                            name: "Current Location",
                            lat: latitude,
                            lon: longitude,
                          });
                        }
                      },
                      () => setLocation(DEFAULT_LOCATION)
                    );
                  } else {
                    setLocation(DEFAULT_LOCATION);
                  }
                }}
              >
                Use My Location
              </Button>
              <Button
                variant="ghost"
                className="text-blue-600 hover:bg-blue-50"
                onClick={() => {
                  setLocation(DEFAULT_LOCATION);
                  setSearchQuery("");
                  setSearchResults([]);
                  setShowDropdown(false);
                }}
              >
                Reset to Default
              </Button>
            </div>
            {/* Show current location */}
            <div className="mt-2 text-sm text-gray-600">
              <span className="font-medium">Current location:</span>{" "}
              {location ? location.name : "-"}
            </div>
          </div>
          {/* Current Conditions */}
          <div className="mb-12">
            <CurrentConditions
              station={weatherData.station}
              location={weatherData.location}
              temperature={weatherData.temperature}
              feels_like={weatherData.feels_like}
              condition={weatherData.condition}
              description={weatherData.description}
              humidity={weatherData.humidity}
              wind_speed={weatherData.wind_speed}
              wind_direction={weatherData.wind_direction}
              visibility={weatherData.visibility}
              pressure={weatherData.pressure}
              uv_index={weatherData.uv_index}
              icon={weatherData.icon}
              last_updated={weatherData.last_updated}
            />
          </div>
          {/* Forecast Section */}
          <div className="mb-12">
            <ForecastSection daily={weatherData.daily} />
          </div>
          {/* Additional Weather Info */}
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            <RainRadar />
            <SunriseSunset sun={weatherData.sun} moon={weatherData.moon} />
            <AirQuality aqi={weatherData.aqi} />
          </div>
          <div className="mt-8">
            <HourlyForecast hourly={weatherData.hourly} />
          </div>
        </div>
      </main>
    </div>
  );
}
