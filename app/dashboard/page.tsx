"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  TrendingUp,
  TrendingDown,
  Droplets,
  AlertTriangle,
  Cloud,
  Activity,
  MapPin,
  Calendar,
  Download,
  Settings,
} from "lucide-react"

// Mock data that would come from Django backend
const dashboardData = {
  overview: {
    totalStations: 1247,
    activeAlerts: 3,
    avgWaterLevel: 2.1,
    weatherStatus: "Partly Cloudy",
  },
  recentAlerts: [
    {
      id: 1,
      location: "River Severn, Worcester",
      type: "Flood Warning",
      severity: "high",
      timestamp: "2024-01-15T10:30:00Z",
      status: "active",
    },
    {
      id: 2,
      location: "River Thames, Reading",
      type: "Water Level Alert",
      severity: "medium",
      timestamp: "2024-01-15T09:15:00Z",
      status: "monitoring",
    },
  ],
  waterLevels: [
    {
      id: 1,
      station: "Thames Barrier",
      location: "London",
      currentLevel: 2.4,
      normalLevel: 2.0,
      trend: "rising",
      lastUpdate: "2024-01-15T11:45:00Z",
    },
    {
      id: 2,
      station: "Severn Bridge",
      location: "Bristol",
      currentLevel: 3.2,
      normalLevel: 2.8,
      trend: "stable",
      lastUpdate: "2024-01-15T11:42:00Z",
    },
  ],
  predictions: [
    {
      location: "River Thames",
      nextHour: 2.5,
      next6Hours: 2.7,
      next24Hours: 2.9,
      confidence: 85,
    },
  ],
}

export default function DashboardPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState("24h")
  const [selectedRegion, setSelectedRegion] = useState("all")

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "medium":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "low":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "rising":
        return <TrendingUp className="h-4 w-4 text-red-500" />
      case "falling":
        return <TrendingDown className="h-4 w-4 text-blue-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Real-time monitoring and analytics</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Stations</p>
                <p className="text-2xl font-bold">{dashboardData.overview.totalStations}</p>
              </div>
              <Droplets className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold">{dashboardData.overview.activeAlerts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Water Level</p>
                <p className="text-2xl font-bold">{dashboardData.overview.avgWaterLevel}m</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Weather</p>
                <p className="text-2xl font-bold">18°C</p>
              </div>
              <Cloud className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="water-levels">Water Levels</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.recentAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        <div>
                          <p className="font-medium">{alert.type}</p>
                          <p className="text-sm text-muted-foreground">{alert.location}</p>
                        </div>
                      </div>
                      <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Water Level Status */}
            <Card>
              <CardHeader>
                <CardTitle>Water Level Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.waterLevels.map((station) => (
                    <div key={station.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium">{station.station}</p>
                          <p className="text-sm text-muted-foreground">{station.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{station.currentLevel}m</span>
                          {getTrendIcon(station.trend)}
                        </div>
                        <p className="text-xs text-muted-foreground">Normal: {station.normalLevel}m</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="water-levels" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Water Level Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Water level charts would be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Alert Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentAlerts.map((alert) => (
                  <div key={alert.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{alert.type}</h4>
                      <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{alert.location}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(alert.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ML Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.predictions.map((prediction, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3">{prediction.location}</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Next Hour</p>
                        <p className="text-lg font-bold">{prediction.nextHour}m</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Next 6 Hours</p>
                        <p className="text-lg font-bold">{prediction.next6Hours}m</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Next 24 Hours</p>
                        <p className="text-lg font-bold">{prediction.next24Hours}m</p>
                      </div>
                    </div>
                    <div className="mt-3 text-center">
                      <Badge variant="outline">Confidence: {prediction.confidence}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
