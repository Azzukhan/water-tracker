import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, User, Eye, Share2, BookmarkPlus, ArrowRight, Tag } from "lucide-react"
import { getCategoryIcon } from "@/lib/blog-category-icons"

const featuredBlog = {
  id: 1,
  title: "The Complete Guide to UK Water Conservation: 50 Practical Tips for Every Household",
  excerpt:
    "Discover comprehensive strategies to reduce your water consumption by up to 40% while saving money on bills. From simple daily habits to smart home technologies, this guide covers everything you need to know about water conservation in the UK.",
  author: "Dr. Sarah Mitchell",
  authorRole: "Water Conservation Expert",
  publishDate: "2024-05-25",
  readTime: "12 min read",
  readCount: 2847,
  category: "Water Conservation",
  tags: ["Conservation", "Home Tips", "Sustainability", "Money Saving"],
  image: "/placeholder.svg?height=400&width=800",
  featured: true,
}

export function FeaturedBlog() {
  const CategoryIcon = getCategoryIcon(featuredBlog.category)
  return (
    <Card className="shadow-xl border-0 overflow-hidden">
      <div className="relative">
        <Badge className="absolute top-4 left-4 bg-yellow-600 text-white z-10">Featured Article</Badge>
        <img
          src={featuredBlog.image || "/placeholder.svg"}
          alt={featuredBlog.title}
          className="w-full h-64 lg:h-80 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
      </div>

      <CardContent className="p-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Badge className="bg-blue-600 text-white flex items-center gap-1">
                  <CategoryIcon className="h-4 w-4" />
                  {featuredBlog.category}
                </Badge>
                <Tag className="h-4 w-4 text-gray-500" />
                {Array.from(new Set(featuredBlog.tags)).slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-4">{featuredBlog.title}</h2>

              <p className="text-lg text-gray-700 leading-relaxed">{featuredBlog.excerpt}</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>{featuredBlog.author}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>{featuredBlog.readTime}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4" />
                  <span>{featuredBlog.readCount.toLocaleString()} reads</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <BookmarkPlus className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>

          {/* Author Info & CTA */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 bg-gray-50 rounded-lg">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{featuredBlog.author}</h3>
                  <p className="text-sm text-gray-600">{featuredBlog.authorRole}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Published {new Date(featuredBlog.publishDate).toLocaleDateString("en-GB")}
                  </p>
                </div>
              </div>
            </div>

            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6">
              Read Full Article
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700 mb-1">40%</div>
                <div className="text-sm text-green-600">Average water savings reported by readers</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
