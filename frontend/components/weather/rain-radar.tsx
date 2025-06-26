"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CloudRain, Clock, MapPin } from "lucide-react"
import dynamic from "next/dynamic"
import { useEffect, useState } from "react"

// Dynamically import Leaflet to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false })

const RainRadarMap = dynamic(() => import("./rain-radar-map"), { ssr: false })

interface RainRadarProps {
  radar?: {
    image_url?: string
    last_updated?: string
    location?: string
    coverage?: number
    intensity?: string
    movement?: string
    next_update?: string
  }
}

const DEFAULT_RADAR = {
  image_url: "/images/radar-placeholder.png",
  last_updated: "Updating...",
  location: "Loading location...",
  coverage: 0,
  intensity: "Light",
  movement: "Stationary",
  next_update: "In 5 minutes"
}

export function RainRadar() {
  return (
    <Card className="shadow-lg border-0 flex flex-col h-full">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-gray-900 dark:text-white">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Rain Radar</CardTitle>
            <p className="text-blue-100">Live precipitation tracking</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              Live
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 flex flex-col flex-1">
        <div className="space-y-6">
          {/* Radar Map */}
          <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
            <RainRadarMap />
          </div>
          <p className="text-xs text-gray-500 text-center">Use scroll or the +/- controls to zoom</p>
          {/* Legend */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              <div className="font-medium mb-2">Radar Legend:</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-200 rounded-full"></div>
                  <span>Light Rain</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <span>Moderate Rain</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span>Heavy Rain</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-800 rounded-full"></div>
                  <span>Intense Rain</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
