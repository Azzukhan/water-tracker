"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Grid, List, MapPin, Search } from "lucide-react";

interface ReservoirSelectorProps {
  selectedReservoir: string;
  onSelect: (name: string) => void;
}

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
      return "bg-blue-600";
    case "Above Average":
      return "bg-green-600";
    case "Normal":
      return "bg-gray-600";
    case "Below Average":
      return "bg-orange-600";
    case "Low":
      return "bg-red-600";
    default:
      return "bg-gray-600";
  }
};

export function SouthernWaterReservoirSelector({
  selectedReservoir,
  onSelect,
}: ReservoirSelectorProps) {
  const [reservoirs, setReservoirs] = useState<Reservoir[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState("");
  const [postcode, setPostcode] = useState("");

  const quickFilters = [
    "Bewl",
    "Darwell",
    "Powdermill",
    "Weir Wood",
  ];

  useEffect(() => {
    fetch("/api/water-levels/southernwater")
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

          <div className="mb-6">
            <Input
              placeholder="Filter reservoirs"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <div className="mb-6 flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600 mr-2">Quick filters:</span>
            {quickFilters.map((name) => (
              <Button
                key={name}
                variant={filter === name ? "secondary" : "outline"}
                size="sm"
                className="text-xs"
                onClick={() => {
                  setFilter(name)
                  onSelect(name)
                }}
              >
                {name}
              </Button>
            ))}
          </div>
          {viewMode === "grid" ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((r) => (
                <div
                  key={r.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    selectedReservoir === r.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                  }`}
                  onClick={() => onSelect(r.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{r.name}</h3>
                    <Badge className={`${getStatusColor(r.status)} text-white`}>
                      {r.level}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
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
          ) : (
            <div className="space-y-3">
              {filtered.map((r) => (
                <div
                  key={r.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                    selectedReservoir === r.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                  onClick={() => onSelect(r.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">
                      {r.name}
                    </span>
                    <Badge className={`${getStatusColor(r.status)} text-white`}>
                      {r.level}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
