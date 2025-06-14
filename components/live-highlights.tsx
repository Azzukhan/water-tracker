import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, TrendingUp, Droplets, Clock, ArrowRight, MapPin } from "lucide-react"
import Link from "next/link"

const highlights = [
  {
    id: 1,
    type: "alert",
    severity: "high",
    title: "Drought Conditions in East England",
    description:
      "Water levels in Essex and Suffolk have dropped to 65% of normal capacity. Residents advised to conserve water usage.",
    location: "East England",
    time: "2 hours ago",
    icon: AlertTriangle,
    color: "border-red-200 bg-red-50",
  },
  {
    id: 2,
    type: "warning",
    severity: "medium",
    title: "Flood Warning for West Scotland",
    description: "Heavy rainfall expected to continue. River levels rising in Glasgow and surrounding areas.",
    location: "West Scotland",
    time: "4 hours ago",
    icon: TrendingUp,
    color: "border-orange-200 bg-orange-50",
  },
  {
    id: 3,
    type: "info",
    severity: "low",
    title: "Water Quality Improvement in Thames",
    description: "Recent infrastructure upgrades show 15% improvement in water quality metrics across London area.",
    location: "London",
    time: "6 hours ago",
    icon: Droplets,
    color: "border-blue-200 bg-blue-50",
  },
]

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "high":
      return "bg-red-600"
    case "medium":
      return "bg-orange-500"
    case "low":
      return "bg-blue-500"
    default:
      return "bg-gray-500"
  }
}

const getSeverityText = (severity: string) => {
  switch (severity) {
    case "high":
      return "Critical"
    case "medium":
      return "Warning"
    case "low":
      return "Info"
    default:
      return "Update"
  }
}

export function LiveHighlights() {
  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold flex items-center">
            <div className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></div>
            Live Highlights
          </CardTitle>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            Real-time
          </Badge>
        </div>
        <p className="text-blue-100">Latest water and weather updates across the UK</p>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-6">
          {highlights.map((highlight) => (
            <div
              key={highlight.id}
              className={`border rounded-xl p-6 ${highlight.color} hover:shadow-md transition-all duration-300 group`}
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-full ${getSeverityColor(highlight.severity)} bg-opacity-10`}>
                  <highlight.icon
                    className={`h-6 w-6 ${getSeverityColor(highlight.severity).replace("bg-", "text-")}`}
                  />
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge className={`${getSeverityColor(highlight.severity)} text-white`}>
                          {getSeverityText(highlight.severity)}
                        </Badge>
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="h-4 w-4 mr-1" />
                          {highlight.location}
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {highlight.title}
                      </h3>
                    </div>

                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {highlight.time}
                    </div>
                  </div>

                  <p className="text-gray-700 leading-relaxed">{highlight.description}</p>

                  <Button
                    variant="outline"
                    size="sm"
                    className="group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors"
                    asChild
                  >
                    <Link href="/news">
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button className="bg-blue-600 hover:bg-blue-700" asChild>
            <Link href="/news">
              View All News Updates
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
