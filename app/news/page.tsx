import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Search, Filter, AlertTriangle, Info, TrendingUp } from "lucide-react"

// Mock data that would come from Django backend
const newsArticles = [
  {
    id: 1,
    title: "Severe Flood Warnings Issued for Northern England",
    summary:
      "Environment Agency issues severe flood warnings for multiple rivers across Yorkshire and Lancashire following heavy rainfall. Residents advised to take immediate action.",
    content: "The Environment Agency has issued severe flood warnings for several rivers across Northern England...",
    category: "Alert",
    severity: "high",
    author: "Environment Agency",
    publishedAt: "2024-01-15T10:30:00Z",
    location: "Northern England",
    tags: ["flood", "warning", "yorkshire", "lancashire"],
    urgent: true,
  },
  {
    id: 2,
    title: "Record Low Water Levels in Southern Reservoirs",
    summary:
      "Drought conditions continue to affect water storage across the South of England, with several reservoirs reaching critically low levels.",
    content: "Water companies across Southern England are reporting record low levels in major reservoirs...",
    category: "Update",
    severity: "medium",
    author: "Water UK",
    publishedAt: "2024-01-15T08:15:00Z",
    location: "Southern England",
    tags: ["drought", "reservoirs", "water-shortage"],
    urgent: false,
  },
  {
    id: 3,
    title: "New Early Warning System Deployed on River Tyne",
    summary:
      "Advanced sensor network installed to provide real-time flood monitoring and early warning capabilities for Newcastle and surrounding areas.",
    content: "A state-of-the-art early warning system has been deployed along the River Tyne...",
    category: "Technology",
    severity: "low",
    author: "Newcastle City Council",
    publishedAt: "2024-01-14T16:45:00Z",
    location: "Newcastle",
    tags: ["technology", "sensors", "early-warning"],
    urgent: false,
  },
  {
    id: 4,
    title: "Climate Change Impact on UK Water Systems",
    summary:
      "New research reveals how climate change is affecting water level patterns across the UK, with implications for future flood management.",
    content: "A comprehensive study by the Met Office and Environment Agency shows...",
    category: "Research",
    severity: "low",
    author: "Met Office",
    publishedAt: "2024-01-14T14:20:00Z",
    location: "UK Wide",
    tags: ["climate-change", "research", "flood-management"],
    urgent: false,
  },
  {
    id: 5,
    title: "Thames Barrier Operational Update",
    summary:
      "Scheduled maintenance completed successfully. The Thames Barrier remains fully operational and ready to protect London from tidal surges.",
    content: "The Thames Barrier has completed its scheduled maintenance program...",
    category: "Infrastructure",
    severity: "low",
    author: "Environment Agency",
    publishedAt: "2024-01-14T11:30:00Z",
    location: "London",
    tags: ["thames-barrier", "maintenance", "infrastructure"],
    urgent: false,
  },
]

export default function NewsPage() {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "medium":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Alert":
        return <AlertTriangle className="h-4 w-4" />
      case "Update":
        return <Info className="h-4 w-4" />
      case "Technology":
        return <TrendingUp className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours} hours ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">News & Alerts</h1>
        <p className="text-muted-foreground">Latest updates on water levels, weather, and flood alerts across the UK</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search news and alerts..." className="pl-10" />
        </div>
        <Select>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="alert">Alerts</SelectItem>
            <SelectItem value="update">Updates</SelectItem>
            <SelectItem value="technology">Technology</SelectItem>
            <SelectItem value="research">Research</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          More Filters
        </Button>
      </div>

      {/* Urgent Alerts */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Urgent Alerts</h2>
        <div className="space-y-4">
          {newsArticles
            .filter((article) => article.urgent)
            .map((article) => (
              <Card key={article.id} className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">URGENT</Badge>
                      <Badge className={getSeverityColor(article.severity)}>{article.severity.toUpperCase()}</Badge>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDate(article.publishedAt)}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{article.title}</h3>
                  <p className="text-muted-foreground mb-3">{article.summary}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{article.author}</span>
                      <span>{article.location}</span>
                    </div>
                    <Button variant="outline" size="sm">
                      Read More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* All News */}
      <div>
        <h2 className="text-xl font-semibold mb-4">All News</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsArticles
            .filter((article) => !article.urgent)
            .map((article) => (
              <Card key={article.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(article.category)}
                      <Badge variant="outline">{article.category}</Badge>
                    </div>
                    <Badge className={getSeverityColor(article.severity)}>{article.severity}</Badge>
                  </div>
                  <CardTitle className="text-lg leading-tight">{article.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{article.summary}</p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{article.author}</span>
                      <span>{article.location}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDate(article.publishedAt)}
                      </div>
                      <Button variant="outline" size="sm">
                        Read More
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* Load More */}
      <div className="text-center mt-8">
        <Button variant="outline">Load More Articles</Button>
      </div>
    </div>
  )
}
