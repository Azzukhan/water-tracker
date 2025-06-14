import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Calendar, ArrowRight } from "lucide-react"
import Link from "next/link"

// Mock data that would come from Django backend
const blogPosts = [
  {
    id: 1,
    title: "Understanding Flood Risk Assessment in the UK",
    excerpt:
      "A comprehensive guide to how flood risk is assessed and managed across different regions of the United Kingdom.",
    content: "Flood risk assessment is a critical component of water management...",
    author: {
      name: "Dr. Sarah Mitchell",
      avatar: "/placeholder.svg?height=40&width=40",
      bio: "Hydrologist and Flood Risk Specialist",
    },
    publishedAt: "2024-01-10T09:00:00Z",
    readTime: 8,
    category: "Education",
    tags: ["flood-risk", "assessment", "uk", "water-management"],
    featured: true,
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 2,
    title: "The Role of Technology in Modern Water Monitoring",
    excerpt:
      "Exploring how IoT sensors, satellite data, and AI are revolutionizing water level monitoring and flood prediction.",
    content: "Modern water monitoring systems rely heavily on advanced technology...",
    author: {
      name: "James Thompson",
      avatar: "/placeholder.svg?height=40&width=40",
      bio: "Environmental Technology Consultant",
    },
    publishedAt: "2024-01-08T14:30:00Z",
    readTime: 6,
    category: "Technology",
    tags: ["iot", "sensors", "ai", "monitoring"],
    featured: false,
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 3,
    title: "Climate Change and UK Water Systems",
    excerpt:
      "How changing weather patterns are affecting water levels and what it means for future flood management strategies.",
    content: "Climate change is having a profound impact on UK water systems...",
    author: {
      name: "Prof. Emma Roberts",
      avatar: "/placeholder.svg?height=40&width=40",
      bio: "Climate Science Researcher",
    },
    publishedAt: "2024-01-05T11:15:00Z",
    readTime: 10,
    category: "Climate",
    tags: ["climate-change", "water-systems", "adaptation"],
    featured: true,
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 4,
    title: "Community Preparedness for Flood Events",
    excerpt: "Essential steps communities can take to prepare for and respond to flood events effectively.",
    content: "Community preparedness is crucial for minimizing flood damage...",
    author: {
      name: "Michael Davies",
      avatar: "/placeholder.svg?height=40&width=40",
      bio: "Emergency Management Specialist",
    },
    publishedAt: "2024-01-03T16:45:00Z",
    readTime: 5,
    category: "Safety",
    tags: ["community", "preparedness", "emergency", "safety"],
    featured: false,
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 5,
    title: "Historical Flood Events: Lessons Learned",
    excerpt: "Examining major flood events in UK history and how they shaped modern flood management practices.",
    content: "Historical flood events provide valuable insights...",
    author: {
      name: "Dr. Helen Carter",
      avatar: "/placeholder.svg?height=40&width=40",
      bio: "Environmental Historian",
    },
    publishedAt: "2024-01-01T10:00:00Z",
    readTime: 12,
    category: "History",
    tags: ["history", "floods", "lessons", "management"],
    featured: false,
    image: "/placeholder.svg?height=200&width=400",
  },
]

const categories = ["All", "Education", "Technology", "Climate", "Safety", "History"]

export default function BlogPage() {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const featuredPosts = blogPosts.filter((post) => post.featured)
  const regularPosts = blogPosts.filter((post) => !post.featured)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Blog</h1>
        <p className="text-muted-foreground">
          Insights, analysis, and expert perspectives on water management and flood prevention
        </p>
      </div>

      {/* Search and Categories */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search blog posts..." className="pl-10" />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((category) => (
            <Button key={category} variant="outline" size="sm" className="whitespace-nowrap">
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Featured Posts</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featuredPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-muted">
                  <img src={post.image || "/placeholder.svg"} alt={post.title} className="w-full h-full object-cover" />
                </div>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{post.category}</Badge>
                    <Badge variant="outline">Featured</Badge>
                  </div>
                  <CardTitle className="text-xl leading-tight">
                    <Link href={`/blog/${post.id}`} className="hover:underline">
                      {post.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{post.excerpt}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
                        <AvatarFallback>
                          {post.author.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-sm">
                        <p className="font-medium">{post.author.name}</p>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(post.publishedAt)}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">{post.readTime} min read</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Regular Posts */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Latest Posts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-muted">
                <img src={post.image || "/placeholder.svg"} alt={post.title} className="w-full h-full object-cover" />
              </div>
              <CardHeader className="pb-3">
                <Badge variant="secondary" className="w-fit">
                  {post.category}
                </Badge>
                <CardTitle className="text-lg leading-tight">
                  <Link href={`/blog/${post.id}`} className="hover:underline">
                    {post.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
                      <AvatarFallback className="text-xs">
                        {post.author.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{post.author.name}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(post.publishedAt)}
                    </div>
                    <span>{post.readTime} min read</span>
                  </div>

                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link href={`/blog/${post.id}`}>
                      Read More <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Load More */}
      <div className="text-center mt-8">
        <Button variant="outline">Load More Posts</Button>
      </div>
    </div>
  )
}
