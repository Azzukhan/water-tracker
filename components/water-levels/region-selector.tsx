"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MapPin, Search, Map, List, Grid } from "lucide-react"

const regions = [
  { id: "scotland", name: "Scotland", level: 88, status: "High" },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "High":
      return "bg-blue-600"
    case "Above Average":
      return "bg-green-600"
    case "Normal":
      return "bg-gray-600"
    case "Below Average":
      return "bg-orange-600"
    case "Low":
      return "bg-red-600"
    default:
      return "bg-gray-600"
  }
}

export function RegionSelector() {
  const [selectedRegion, setSelectedRegion] = useState("scotland")
  const [viewMode, setViewMode] = useState<"list" | "grid" | "map">("grid")
  const [postcode, setPostcode] = useState("")

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <CardTitle className="text-2xl font-bold">Select Region</CardTitle>
            <p className="text-blue-100">Choose a region to view detailed water level data</p>
          </div>

          {/* View Mode Toggle */}
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
        {/* Postcode Search */}
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

        {/* Quick Region Selector */}
        <div className="mb-6">
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a region" />
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region.id} value={region.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{region.name}</span>
                    <Badge className={`ml-2 ${getStatusColor(region.status)} text-white`}>{region.level}%</Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Region Grid/List View */}
        {viewMode === "grid" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regions.map((region) => (
              <div
                key={region.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  selectedRegion === region.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                }`}
                onClick={() => setSelectedRegion(region.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{region.name}</h3>
                  <Badge className={`${getStatusColor(region.status)} text-white`}>{region.level}%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status: {region.status}</span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${region.level}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === "list" && (
          <div className="space-y-3">
            {regions.map((region) => (
              <div
                key={region.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                  selectedRegion === region.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"
                }`}
                onClick={() => setSelectedRegion(region.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{region.name}</h3>
                      <p className="text-sm text-gray-600">Status: {region.status}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{region.level}%</div>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${region.level}%` }}></div>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(region.status)} text-white`}>{region.status}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === "map" && (
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <Map className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Interactive Map View</h3>
            <p className="text-gray-600 mb-4">Click on regions to view detailed water level information</p>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-sm text-gray-500 mb-4">Map visualization would be integrated here</div>
              <div className="grid grid-cols-3 gap-2">
                {regions.slice(0, 9).map((region) => (
                  <div
                    key={region.id}
                    className={`p-2 rounded text-xs cursor-pointer transition-colors ${
                      selectedRegion === region.id ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
                    }`}
                    onClick={() => setSelectedRegion(region.id)}
                  >
                    {region.name.split(" ")[0]}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
