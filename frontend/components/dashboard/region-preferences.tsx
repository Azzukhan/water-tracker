"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { MapPin, Star, Plus, Check, Trash2 } from "lucide-react"

const regions = [
  { id: "scotland", name: "Scotland", level: 88, status: "High" },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "High":
      return "bg-blue-600 dark:bg-blue-700"
    case "Above Average":
      return "bg-green-600 dark:bg-green-700"
    case "Normal":
      return "bg-gray-600 dark:bg-gray-500"
    case "Below Average":
      return "bg-orange-600 dark:bg-orange-700"
    case "Low":
      return "bg-red-600 dark:bg-red-700"
    default:
      return "bg-gray-600 dark:bg-gray-500"
  }
}

export function RegionPreferences() {
  const [selectedRegion, setSelectedRegion] = useState("scotland")
  const [savedRegions, setSavedRegions] = useState<string[]>([])
  const [autoDetect, setAutoDetect] = useState(true)

  // Load saved regions from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem("savedRegions")
    if (saved) {
      setSavedRegions(JSON.parse(saved))
    } else {
      // Default to Scotland if no saved regions
      setSavedRegions(["scotland"])
    }
  }, [])

  // Save regions to localStorage when they change
  useEffect(() => {
    localStorage.setItem("savedRegions", JSON.stringify(savedRegions))
  }, [savedRegions])

  const addRegion = () => {
    if (!savedRegions.includes(selectedRegion)) {
      setSavedRegions([...savedRegions, selectedRegion])
    }
  }

  const removeRegion = (regionId: string) => {
    setSavedRegions(savedRegions.filter((id) => id !== regionId))
  }

  const setDefaultRegion = (regionId: string) => {
    // Move the selected region to the front of the array
    setSavedRegions([regionId, ...savedRegions.filter((id) => id !== regionId)])
  }

  return (
    <Card className="shadow-lg border-0 dark:border-gray-700 dark:bg-gray-800">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-800 dark:to-cyan-800 text-white">
        <CardTitle className="text-xl font-bold flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Region Preferences
        </CardTitle>
        <p className="text-blue-100">Customize your preferred water monitoring regions</p>
      </CardHeader>

      <CardContent className="p-6">
        {/* Auto-detect Location */}
        <div className="flex items-center justify-between mb-6 p-4 bg-blue-50 dark:bg-gray-700/50 rounded-lg">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-1">Auto-detect Location</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Automatically detect your location for regional water data
            </p>
          </div>
          <Switch checked={autoDetect} onCheckedChange={setAutoDetect} />
        </div>

        {/* Add Region */}
        <div className="mb-6">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">Add Region to Monitor</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={addRegion}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Region
            </Button>
          </div>
        </div>

        {/* Saved Regions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900 dark:text-white">Your Saved Regions</h3>
            <Badge className="bg-blue-600 dark:bg-blue-700">{savedRegions.length} Regions</Badge>
          </div>

          {savedRegions.length === 0 ? (
            <div className="text-center p-6 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <MapPin className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
              <p className="text-gray-600 dark:text-gray-400">No regions saved yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Add regions to monitor water levels and receive alerts
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedRegions.map((regionId, index) => {
                const region = regions.find((r) => r.id === regionId)
                if (!region) return null

                const isDefault = index === 0

                return (
                  <div
                    key={region.id}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      isDefault
                        ? "border-blue-500 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-800"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {isDefault && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{region.name}</h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                            <Badge className={`${getStatusColor(region.status)} text-white text-xs`}>
                              {region.level}% - {region.status}
                            </Badge>
                            {isDefault && <span className="text-xs">Default Region</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {!isDefault && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDefaultRegion(region.id)}
                            className="text-xs"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Set Default
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeRegion(region.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-xs"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            <p>
              <span className="font-medium">Default region</span> is used as your primary view when visiting water level
              pages
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
