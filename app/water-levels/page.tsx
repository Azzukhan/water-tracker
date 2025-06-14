import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, Minus, Search, Filter } from "lucide-react"

const waterLevels = [
  {
    id: 1,
    name: "River Thames at London Bridge",
    location: "London",
    level: 2.4,
    unit: "m",
    status: "normal",
    trend: "stable",
    lastUpdated: "2 minutes ago",
    coordinates: "51.5074, -0.1278",
  },
  {
    id: 2,
    name: "River Severn at Worcester",
    location: "Worcester",
    level: 1.8,
    unit: "m",
    status: "high",
    trend: "rising",
    lastUpdated: "5 minutes ago",
    coordinates: "52.1936, -2.2208",
  },
  {
    id: 3,
    name: "Lake Windermere",
    location: "Lake District",
    level: 39.2,
    unit: "m",
    status: "normal",
    trend: "falling",
    lastUpdated: "1 minute ago",
    coordinates: "54.3719, -2.9621",
  },
  {
    id: 4,
    name: "River Tyne at Newcastle",
    location: "Newcastle",
    level: 0.9,
    unit: "m",
    status: "low",
    trend: "stable",
    lastUpdated: "3 minutes ago",
    coordinates: "54.9783, -1.6178",
  },
  {
    id: 5,
    name: "River Mersey at Liverpool",
    location: "Liverpool",
    level: 3.1,
    unit: "m",
    status: "high",
    trend: "rising",
    lastUpdated: "4 minutes ago",
    coordinates: "53.4084, -2.9916",
  },
  {
    id: 6,
    name: "Loch Ness",
    location: "Scotland",
    level: 15.8,
    unit: "m",
    status: "normal",
    trend: "stable",
    lastUpdated: "6 minutes ago",
    coordinates: "57.3229, -4.4244",
  },
]

export default function WaterLevelsPage() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "low":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
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
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Water Levels</h1>
        <p className="text-muted-foreground">Real-time water level monitoring across the UK</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search locations..." className="pl-10" />
        </div>
        <Select>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="level">Water Level</SelectItem>
            <SelectItem value="updated">Last Updated</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          More Filters
        </Button>
      </div>

      {/* Water Levels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {waterLevels.map((location) => (
          <Card key={location.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{location.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{location.location}</p>
                </div>
                <Badge className={getStatusColor(location.status)}>{location.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current Level</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{location.level}</span>
                    <span className="text-sm text-muted-foreground">{location.unit}</span>
                    {getTrendIcon(location.trend)}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Trend</span>
                  <span className="capitalize">{location.trend}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span>{location.lastUpdated}</span>
                </div>

                <div className="pt-2">
                  <Button variant="outline" size="sm" className="w-full">
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center mt-8">
        <Button variant="outline">Load More Locations</Button>
      </div>
    </div>
  )
}
