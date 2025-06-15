"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, User, Eye, Share2, BookmarkPlus, ArrowRight, Tag } from "lucide-react"

// Dummy blog data
const blogPosts = [
  {
    id: 2,
    title: "Why Saving Water Matters: The Environmental and Economic Impact",
    excerpt:
      "Understanding the critical importance of water conservation for our planet's future and your household budget.",
    author: "Emma Thompson",
    publishDate: "2024-05-24",
    readTime: "8 min read",
    readCount: 1523,
    category: "Sustainability",
    tags: ["Environment", "Economics", "Conservation"],
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 3,
    title: "How Droughts Happen: Understanding the Science Behind Water Scarcity",
    excerpt:
      "Explore the meteorological and environmental factors that lead to drought conditions and their impact on water supplies.",
    author: "Prof. James Wilson",
    publishDate: "2024-05-23",
    readTime: "10 min read",
    readCount: 2156,
    category: "Emergency Preparedness",
    tags: ["Drought", "Climate", "Science"],
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 4,
    title: "Smart Home Water Management: Technology That Saves Money",
    excerpt:
      "Discover the latest smart devices and systems that can help you monitor and reduce your home's water consumption.",
    author: "Tech Team",
    publishDate: "2024-05-22",
    readTime: "6 min read",
    readCount: 987,
    category: "Innovation & Tech",
    tags: ["Smart Home", "Technology", "Efficiency"],
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 5,
    title: "Garden Water Conservation: Beautiful Landscapes with Less Water",
    excerpt:
      "Learn how to create and maintain stunning gardens while significantly reducing water usage through smart design and plant selection.",
    author: "Lisa Green",
    publishDate: "2024-05-21",
    readTime: "7 min read",
    readCount: 1342,
    category: "Home & Garden",
    tags: ["Gardening", "Landscaping", "Conservation"],
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 6,
    title: "Understanding Your Water Bill: Hidden Costs and Saving Opportunities",
    excerpt:
      "Decode your water bill and discover practical ways to reduce costs while supporting sustainable water use.",
    author: "Financial Team",
    publishDate: "2024-05-20",
    readTime: "5 min read",
    readCount: 2234,
    category: "Home & Garden",
    tags: ["Bills", "Money Saving", "Understanding"],
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 7,
    title: "Flood Preparedness: Protecting Your Home and Family",
    excerpt:
      "Essential steps to prepare for flooding events and minimize damage to your property and ensure family safety.",
    author: "Emergency Team",
    publishDate: "2024-05-19",
    readTime: "9 min read",
    readCount: 1876,
    category: "Emergency Preparedness",
    tags: ["Flooding", "Safety", "Preparedness"],
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 8,
    title: "The Future of Water: Innovations Shaping the UK Water Industry",
    excerpt:
      "Explore cutting-edge technologies and innovations that are revolutionizing how we manage and conserve water resources.",
    author: "Industry Experts",
    publishDate: "2024-05-18",
    readTime: "11 min read",
    readCount: 1654,
    category: "Industry Insights",
    tags: ["Innovation", "Future", "Industry"],
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 9,
    title: "Business Water Efficiency: Strategies for Commercial Success",
    excerpt:
      "Comprehensive guide for businesses to reduce water consumption, cut costs, and improve sustainability credentials.",
    author: "Business Team",
    publishDate: "2024-05-17",
    readTime: "8 min read",
    readCount: 892,
    category: "Business Solutions",
    tags: ["Business", "Efficiency", "Sustainability"],
    image: "/placeholder.svg?height=200&width=400",
  },
]

const getCategoryColor = (category: string) => {
  const colors: { [key: string]: string } = {
    "Water Conservation": "bg-blue-600",
    Sustainability: "bg-green-600",
    "Innovation & Tech": "bg-purple-600",
    "Emergency Preparedness": "bg-red-600",
    "Industry Insights": "bg-orange-600",
    "Home & Garden": "bg-cyan-600",
    "Business Solutions": "bg-indigo-600",
  }
  return colors[category] || "bg-gray-600"
}

export function BlogGrid() {
  const [currentPage, setCurrentPage] = useState(1)
  const [bookmarkedPosts, setBookmarkedPosts] = useState<number[]>([])
  const postsPerPage = 6

  const totalPages = Math.ceil(blogPosts.length / postsPerPage)
  const startIndex = (currentPage - 1) * postsPerPage
  const currentPosts = blogPosts.slice(startIndex, startIndex + postsPerPage)

  const toggleBookmark = (id: number) => {
    setBookmarkedPosts((prev) => (prev.includes(id) ? prev.filter((post) => post !== id) : [...prev, id]))
  }

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Latest Articles</h2>
          <p className="text-gray-600">{blogPosts.length} educational articles available</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <Button variant="outline" size="sm">
            Most Recent
          </Button>
        </div>
      </div>

      {/* Blog Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentPosts.map((post) => {
          const isBookmarked = bookmarkedPosts.includes(post.id)

          return (
            <Card
              key={post.id}
              className="shadow-lg border-0 hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col h-full"
            >
              <div className="relative">
                <img
                  src={post.image || "/placeholder.svg"}
                  alt={post.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <Badge className={`absolute top-3 left-3 ${getCategoryColor(post.category)} text-white text-xs`}>
                  {post.category}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`absolute top-3 right-3 ${
                    isBookmarked ? "text-yellow-600 bg-white/90" : "text-gray-600 bg-white/90"
                  } hover:bg-white`}
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleBookmark(post.id)
                  }}
                >
                  <BookmarkPlus className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
                </Button>
              </div>

              <CardContent className="p-6 flex flex-col h-full">
                <div className="space-y-4 flex-1 flex flex-col">
                  {/* Title and Excerpt */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight mb-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{post.excerpt}</p>
                  </div>

                  {/* Tags */}
                  <div className="flex items-center flex-wrap gap-2">
                    <Tag className="h-3 w-3 text-gray-500" />
                    {Array.from(new Set(post.tags)).slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{post.readCount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 mt-auto">
                    <div className="text-xs text-gray-500">
                      {new Date(post.publishDate).toLocaleDateString("en-GB")}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs">
                        Read More
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
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
          Showing {startIndex + 1}-{Math.min(startIndex + postsPerPage, blogPosts.length)} of {blogPosts.length}{" "}
          articles
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
