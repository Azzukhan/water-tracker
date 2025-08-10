"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MapPin, Search, Navigation, Clock, CheckCircle } from "lucide-react"

interface Location {
  name: string
  region: string
  temp: string
  condition: string
}

interface LocationInputProps {
  weather: {
    current: {
      location: string
      temperature: number
      condition: string
    }
    popular_locations?: Location[]
  }
  onLocationSelect: (location: string) => void
}

// Default popular locations
const DEFAULT_POPULAR_LOCATIONS: Location[] = [
  { name: "London", region: "England", temp: "18°C", condition: "Partly Cloudy" },
  { name: "Manchester", region: "England", temp: "16°C", condition: "Light Rain" },
  { name: "Edinburgh", region: "Scotland", temp: "14°C", condition: "Cloudy" },
  { name: "Cardiff", region: "Wales", temp: "17°C", condition: "Sunny" },
  { name: "Belfast", region: "Northern Ireland", temp: "15°C", condition: "Light Rain" }
]

export function LocationInput({ weather, onLocationSelect }: LocationInputProps) {
  const [location, setLocation] = useState("")
  const [currentLocation, setCurrentLocation] = useState(weather.current.location)
  const [isLocating, setIsLocating] = useState(false)

  const handleGeolocation = () => {
    setIsLocating(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you would reverse geocode these coordinates
          setCurrentLocation("My Location") // Placeholder, should be replaced with real reverse geocode
          setIsLocating(false)
        },
        (error) => {
          console.error("Geolocation error:", error)
          setIsLocating(false)
        }
      )
    } else {
      setIsLocating(false)
    }
  }

  const handleLocationSelect = (locationName: string) => {
    setCurrentLocation(locationName)
    onLocationSelect(locationName)
    setLocation("")
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-sky-500 to-blue-600 text-gray-900 dark:text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <CardTitle className="text-2xl font-bold">Weather Location</CardTitle>
            <p className="text-sky-100">Select your location for accurate weather information</p>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-300" />
            <span className="text-sm text-white">Live Data</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Current Location Display */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">{currentLocation}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Current weather location</div>
              </div>
            </div>
            <Badge className="bg-blue-600 text-white">Active</Badge>
          </div>
        </div>

        {/* Location Search */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Enter city name or postcode (e.g., Manchester, M1 1AA)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handleLocationSelect(location)} disabled={!location}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button
                variant="outline"
                onClick={handleGeolocation}
                disabled={isLocating}
                className="border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:bg-blue-900"
              >
                {isLocating ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    Locating...
                  </>
                ) : (
                  <>
                    <Navigation className="h-4 w-4 mr-2" />
                    Use My Location
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Location Info */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-start space-x-3">
            <MapPin className="h-5 w-5 text-gray-600 dark:text-gray-300 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">Location Services</div>
              <div className="text-gray-600 dark:text-gray-300">
                We use your location to provide the most accurate weather data for your area. Location data is not
                stored and is only used for weather services.
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
