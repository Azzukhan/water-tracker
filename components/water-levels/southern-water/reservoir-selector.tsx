"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Grid, List } from "lucide-react";

interface ReservoirSelectorProps {
  selectedReservoir: string;
  onSelect: (name: string) => void;
}

const reservoirs = ["Bewl", "Darwell", "Powdermill", "Weir Wood"];

export function SouthernWaterReservoirSelector({
  selectedReservoir,
  onSelect,
}: ReservoirSelectorProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState("");

  const filtered = reservoirs.filter((r) =>
    r.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <CardTitle className="text-2xl font-bold">Select Reservoir</CardTitle>
              <p className="text-blue-100">Choose a reservoir to view detailed water level data</p>
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
            <Input
              placeholder="Filter reservoirs"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          {viewMode === "grid" ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((r) => (
                <div
                  key={r}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    selectedReservoir === r
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                  }`}
                  onClick={() => onSelect(r)}
                >
                  <h3 className="font-semibold text-gray-900 text-center">{r}</h3>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((r) => (
                <div
                  key={r}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                    selectedReservoir === r
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                  onClick={() => onSelect(r)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">{r}</span>
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
