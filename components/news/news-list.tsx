"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, ExternalLink, Bookmark, Share2, TrendingUp, AlertTriangle, Droplets, Building } from "lucide-react"

// Dummy news data
const newsData = [
  {
    id: 1,
    headline: "Thames Water Announces £2.5bn Infrastructure Investment for London Water Security",
    summary:
      "Thames Water has unveiled plans for a major infrastructure upgrade across London, focusing on improving water security and reducing leakage by 30% over the next five years.",
    date: "2024-05-29",
    source: "Water Industry News",
    company: "Thames Water",
    region: "London",
    eventType: "Investment",
    priority: "high",
    readTime: "3 min read",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 2,
    headline: "Scottish Water Achieves Record Low Leakage Rates Across Central Scotland",
    summary:
      "New smart meter technology and AI-powered leak detection systems have helped Scottish Water reduce water loss to historic lows in Glasgow and Edinburgh areas.",
    date: "2024-05-28",
    source: "Scottish Water Press",
    company: "Scottish Water",
    region: "Scotland",
    eventType: "Infrastructure",
    priority: "medium",
    readTime: "2 min read",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 3,
    headline: "Environment Agency Issues Drought Warning for South East England",
    summary:
      "Following weeks of below-average rainfall, the Environment Agency has issued drought warnings for Kent, Sussex, and Surrey, urging residents to conserve water.",
    date: "2024-05-27",
    source: "Environment Agency",
    company: "Environment Agency",
    region: "South East",
    eventType: "Emergency",
    priority: "high",
    readTime: "4 min read",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 4,
    headline: "Yorkshire Water Launches Innovative Water Quality Monitoring Program",
    summary:
      "Real-time water quality sensors are being deployed across Yorkshire's water network, providing customers with live updates on water quality in their area.",
    date: "2024-05-26",
    source: "Yorkshire Water",
    company: "Yorkshire Water",
    region: "Yorkshire",
    eventType: "Water Quality",
    priority: "medium",
    readTime: "3 min read",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 5,
    headline: "Natural Resources Wales Reports Improved River Water Quality",
    summary:
      "Latest monitoring data shows significant improvements in river water quality across Wales, with 85% of rivers now meeting good ecological status.",
    date: "2024-05-25",
    source: "Natural Resources Wales",
    company: "Natural Resources Wales",
    region: "Wales",
    eventType: "Environmental",
    priority: "low",
    readTime: "2 min read",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 6,
    headline: "United Utilities Completes Major Reservoir Upgrade in Manchester",
    summary:
      "The £150m upgrade to Thirlmere Reservoir includes new filtration systems and increased capacity to serve the growing population of Greater Manchester.",
    date: "2024-05-24",
    source: "United Utilities",
    company: "United Utilities",
    region: "North West",
    eventType: "Infrastructure",
    priority: "medium",
    readTime: "3 min read",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 7,
    headline: "New Water Efficiency Regulations Come into Effect Across UK",
    summary:
      "Government introduces stricter water efficiency standards for new buildings, requiring all new homes to use no more than 110 litres per person per day.",
    date: "2024-05-23",
    source: "DEFRA",
    company: "Government",
    region: "All Regions",
    eventType: "Policy",
    priority: "high",
    readTime: "5 min read",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 8,
    headline: "Severn Trent Invests in AI-Powered Flood Prediction System",
    summary:
      "Advanced machine learning algorithms will help predict and prevent flooding across the Severn Trent region, protecting thousands of homes and businesses.",
    date: "2024-05-22",
    source: "Severn Trent",
    company: "Severn Trent",
    region: "Midlands",
    eventType: "Innovation",
    priority: "medium",
    readTime: "4 min read",
    image: "/placeholder.svg?height=200&width=400",
  },
]

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-600"
    case "medium":
      return "bg-orange-500"
    case "low":
      return "bg-green-600"
    default:
      return "bg-gray-500"
  }
}

const getEventTypeIcon = (eventType: string) => {
  switch (eventType) {
    case "Emergency":
      return AlertTriangle
    case "Investment":
      return TrendingUp
    case "Water Quality":
      return Droplets
    case "Infrastructure":
      return Building
    default:
      return Clock
  }
}

export function NewsList() {
  const [currentPage, setCurrentPage] = useState(1)
  const [bookmarkedItems, setBookmarkedItems] = useState<number[]>([])
  const itemsPerPage = 5

  const totalPages = Math.ceil(newsData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentNews = newsData.slice(startIndex, startIndex + itemsPerPage)

  const toggleBookmark = (id: number) => {
    setBookmarkedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Latest News</h2>
          <p className="text-gray-600">{newsData.length} stories found</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <Button variant="outline" size="sm">
            Most Recent
          </Button>
        </div>
      </div>

      {/* News Items */}
      <div className="space-y-6">
        {currentNews.map((news) => {
          const EventIcon = getEventTypeIcon(news.eventType)
          const isBookmarked = bookmarkedItems.includes(news.id)

          return (
            <Card key={news.id} className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-4 gap-6">
                  {/* News Image */}
                  <div className="md:col-span-1">
                    <div className="relative">
                      <img
                        src={news.image || "/placeholder.svg"}
                        alt={news.headline}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Badge className={`absolute top-2 left-2 ${getPriorityColor(news.priority)} text-white text-xs`}>
                        {news.priority.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  {/* News Content */}
                  <div className="md:col-span-3">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors leading-tight">
                            {news.headline}
                          </h3>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{new Date(news.date).toLocaleDateString("en-GB")}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <EventIcon className="h-4 w-4" />
                              <span>{news.eventType}</span>
                            </div>
                            <span>•</span>
                            <span>{news.readTime}</span>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleBookmark(news.id)}
                          className={isBookmarked ? "text-yellow-600" : "text-gray-400"}
                        >
                          <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
                        </Button>
                      </div>

                      {/* Summary */}
                      <p className="text-gray-700 leading-relaxed">{news.summary}</p>

                      {/* Tags and Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {news.company}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {news.region}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {news.source}
                          </Badge>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </Button>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Read More
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, newsData.length)} of {newsData.length} results
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(page)}
              className="w-10"
            >
              {page}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
