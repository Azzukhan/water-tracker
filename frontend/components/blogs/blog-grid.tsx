"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BookmarkPlus } from "lucide-react"
import { BlogCard } from "./blog-card"
import type { BlogItem } from "@/hooks/use-blogs"

// Fallback posts used when no data is provided
const fallbackPosts = [
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
]

const getCategoryColor = (category: string) => {
  const colors: { [key: string]: string } = {
    "Water Conservation": "bg-blue-600 cb:bg-cbBlue",
    Sustainability: "bg-green-600 cb:bg-cbBluishGreen",
    "Innovation & Tech": "bg-purple-600 cb:bg-cbPurple",
    "Emergency Preparedness": "bg-red-600 cb:bg-cbVermillion",
    "Industry Insights": "bg-orange-600 cb:bg-cbOrange",
    "Home & Garden": "bg-cyan-600 cb:bg-cbSkyBlue",
    "Business Solutions": "bg-indigo-600 cb:bg-cbPurple",
  }
  return colors[category] || "bg-gray-600"
}

export interface BlogGridProps {
  posts?: BlogItem[]
}

export function BlogGrid({ posts = fallbackPosts }: BlogGridProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [bookmarkedPosts, setBookmarkedPosts] = useState<string[]>([])
  const postsPerPage = 6

  const totalPages = Math.ceil(posts.length / postsPerPage)
  const startIndex = (currentPage - 1) * postsPerPage
  const currentPosts = posts.slice(startIndex, startIndex + postsPerPage)

  const toggleBookmark = (key: string) => {
    setBookmarkedPosts((prev) => (prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]))
  }

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Latest Articles</h2>
          <p className="text-gray-600 dark:text-gray-400">{posts.length} educational articles available</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
          <Button variant="outline" size="sm">
            Most Recent
          </Button>
        </div>
      </div>

      {/* Blog Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentPosts.map((post) => {
          const key = String((post as any).id ?? post.link)
          const isBookmarked = bookmarkedPosts.includes(key)
          return (
            <div key={key} className="relative">
              <BlogCard post={post} isBookmarked={isBookmarked} onBookmark={() => toggleBookmark(key)} />
              <Button
                variant="ghost"
                size="sm"
                className={`absolute top-3 right-3 ${
                  isBookmarked
                    ? "text-yellow-600 dark:text-yellow-400 cb:text-cbYellow bg-white/90 dark:bg-gray-800/90"
                    : "text-gray-600 dark:text-gray-300 bg-white/90 dark:bg-gray-800/90"
                } hover:bg-white dark:hover:bg-gray-700`}
                onClick={(e) => {
                  e.stopPropagation()
                  toggleBookmark(key)
                }}
              >
                <BookmarkPlus className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
              </Button>
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {startIndex + 1}-{Math.min(startIndex + postsPerPage, posts.length)} of {posts.length}{" "}
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
