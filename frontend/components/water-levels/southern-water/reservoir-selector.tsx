"use client";

import { useState, useEffect } from "react";
import { API_BASE } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Grid, List, MapPin, Map, Search, ArrowDown, ArrowUp, Minus } from "lucide-react";

interface Reservoir {
  id: string;
  name: string;
  level: number;
  status: string;
  change: number;
  difference: number;
  date: string;
}

const statusForLevel = (level: number) => {
  if (level >= 90) return "High";
  if (level >= 80) return "Normal";
  if (level >= 70) return "Below Average";
  return "Low";
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "High":
    case "Above Average":
      return "bg-blue-600 cb:bg-cbBlue";
    case "Normal":
      return "bg-green-600 cb:bg-cbBlueGreen";
    case "Below Average":
      return "bg-orange-600 cb:bg-cbOrange";
    case "Low":
      return "bg-red-600 cb:bg-cbVermillion";
    default:
      return "bg-gray-600 cb:bg-cbGrey";
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "High":
    case "Above Average":
      return ArrowUp;
    case "Below Average":
    case "Low":
      return ArrowDown;
    default:
      return Minus;
  }
}

interface ReservoirSelectorProps {
  selectedReservoir: string;
  onSelect: (name: string) => void;
}

export function SouthernWaterReservoirSelector({
  selectedReservoir,
  onSelect,
}: ReservoirSelectorProps) {
  const [reservoirs, setReservoirs] = useState<Reservoir[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "grid" | "map">("grid");
  const [postcode, setPostcode] = useState("");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/api/water-levels/southernwater-reservoirs/`)
      .then((res) => res.json())
      .then((data: any[]) => {
        if (Array.isArray(data)) {
          const latestByReservoir: Record<string, any> = {};
          data.forEach((r) => {
            if (
              !latestByReservoir[r.reservoir] ||
              new Date(r.date) > new Date(latestByReservoir[r.reservoir].date)
            ) {
              latestByReservoir[r.reservoir] = r;
            }
          });
          const result: Reservoir[] = Object.values(latestByReservoir).map(
            (r: any) => ({
              id: r.reservoir,
              name: r.reservoir,
              level: r.current_level,
              status: statusForLevel(r.current_level),
              change: r.change_week,
              difference: r.difference_from_average,
              date: r.date,
            }),
          );
          setReservoirs(result);
          if (result.length) onSelect(result[0].id);
        }
      })
      .catch(() => setReservoirs([]));
  }, []);

  const filtered = reservoirs.filter((r) =>
    r.name.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <CardTitle className="text-2xl font-bold">
                Select Reservoir
              </CardTitle>
              <p className="text-blue-100">
                Choose a reservoir to view detailed water level data
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="text-white hover:bg-white/20"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="text-white hover:bg-white/20"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "map" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("map")}
                className="text-white hover:bg-white/20"
              >
                <Map className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Enter postcode (e.g., SW1A 1AA)"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <MapPin className="h-4 w-4 mr-2" />
                Find My Area
              </Button>
            </div>
          </div>

          <div className="mb-6 space-y-2">
            <Input
              placeholder="Filter reservoirs"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <Select value={selectedReservoir} onValueChange={onSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a reservoir" />
              </SelectTrigger>
              <SelectContent>
                {filtered.map((res) => (
                  <SelectItem key={res.id} value={res.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{res.name}</span>
                      {(() => {
                        const Icon = getStatusIcon(res.status)
                        return (
                          <Badge
                            className={`ml-2 ${getStatusColor(res.status)} text-white flex items-center gap-1`}
                          >
                            <Icon className="h-3 w-3" aria-hidden="true" />
                            {res.level}%
                          </Badge>
                        )
                      })()}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {viewMode === "grid" && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((r) => (
                <div
                  key={r.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    selectedReservoir === r.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900"
                      : "border-gray-200 hover:border-blue-300 hover:bg-gray-50 dark:bg-gray-800"
                  }`}
                  onClick={() => onSelect(r.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{r.name}</h3>
                    {(() => {
                      const Icon = getStatusIcon(r.status)
                      return (
                        <Badge className={`${getStatusColor(r.status)} text-white flex items-center gap-1`}>
                          <Icon className="h-3 w-3" aria-hidden="true" />
                          {r.level}%
                        </Badge>
                      )
                    })()}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Status: {r.status}
                    </span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${r.level}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === "list" && (
            <div className="space-y-3">
              {filtered.map((r) => (
                <div
                  key={r.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                    selectedReservoir === r.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900"
                      : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                  }`}
                  onClick={() => onSelect(r.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{r.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Status: {r.status}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{r.level}%</div>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${r.level}%` }}></div>
                        </div>
                      </div>
                      {(() => {
                        const Icon = getStatusIcon(r.status)
                        return (
                          <Badge className={`${getStatusColor(r.status)} text-white flex items-center gap-1`}>
                            <Icon className="h-3 w-3" aria-hidden="true" />
                            {r.status}
                          </Badge>
                        )
                      })()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === "map" && (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
              <Map className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Interactive Map View</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Click on reservoirs to view detailed water level information</p>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">Map visualization would be integrated here</div>
                <div className="grid grid-cols-3 gap-2">
                  {filtered.slice(0, 9).map((r) => (
                    <div
                      key={r.id}
                      className={`p-2 rounded text-xs cursor-pointer transition-colors ${
                        selectedReservoir === r.id ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                      }`}
                      onClick={() => onSelect(r.id)}
                    >
                      {r.name.split(" ")[0]}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
