"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Grid, List, ArrowDown, ArrowUp, Minus } from "lucide-react";

interface Props {
  region: string;
  onSelect: (r: string) => void;
}

interface RegionInfo {
  id: string;
  name: string;
  level: number;
  status: string;
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
};

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
};

export function EnglandRegionSelector({ region, onSelect }: Props) {
  const [regions, setRegions] = useState<RegionInfo[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/api/water-levels/groundwater/summary/`)
      .then((res) => res.json())
      .then((data) => {
        const result: RegionInfo[] = [];
        if (data && data.regions) {
          Object.entries(data.regions).forEach(([name, level]: any) => {
            result.push({
              id: name as string,
              name: name as string,
              level: Number(level),
              status: statusForLevel(Number(level)),
            });
          });
        }
        setRegions(result);
        if (result.length) onSelect(result[0].id);
      })
      .catch(() => setRegions([]));
  }, []);

  const filtered = regions.filter((r) =>
    r.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">Select Region</CardTitle>
          <div className="flex space-x-2">
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
      <CardContent className="p-6 space-y-4">
        <Input
          placeholder="Filter regions"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <Select value={region} onValueChange={onSelect}>
          <SelectTrigger className="w-full capitalize">
            <SelectValue placeholder="Select region" className="capitalize" />
          </SelectTrigger>
          <SelectContent>
            {filtered.map((r) => (
              <SelectItem key={r.id} value={r.id} className="capitalize">
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {viewMode === "grid" && (
          <div className="grid md:grid-cols-2 gap-4 pt-4">
            {filtered.map((r) => (
              <div
                key={r.id}
                onClick={() => onSelect(r.id)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  region === r.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900"
                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50 dark:bg-gray-800"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 capitalize">
                    {r.name}
                  </h3>
                  {(() => {
                    const Icon = getStatusIcon(r.status);
                    return (
                      <Badge
                        className={`${getStatusColor(r.status)} text-white flex items-center gap-1`}
                      >
                        <Icon className="h-3 w-3" aria-hidden="true" />
                        {r.level.toFixed(1)}%
                      </Badge>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === "list" && (
          <div className="space-y-3 pt-4">
            {filtered.map((r) => (
              <div
                key={r.id}
                onClick={() => onSelect(r.id)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  region === r.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900"
                    : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="capitalize">{r.name}</span>
                  {(() => {
                    const Icon = getStatusIcon(r.status);
                    return (
                      <Badge
                        className={`${getStatusColor(r.status)} text-white flex items-center gap-1`}
                      >
                        <Icon className="h-3 w-3" aria-hidden="true" />
                        {r.level.toFixed(1)}%
                      </Badge>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
