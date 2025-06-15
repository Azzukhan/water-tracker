import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { TrendingUp, Search, Mail, Star, Users, BookOpen, Share2 } from "lucide-react"
import html2canvas from "html2canvas"

const popularPosts = [
  {
    title: "10 Quick Water-Saving Tips for Busy Families",
    readCount: 3421,
    category: "Water Conservation",
  },
  {
    title: "Understanding UK Water Quality Standards",
    readCount: 2876,
    category: "Industry Insights",
  },
  {
    title: "Rainwater Harvesting: A Complete Guide",
    readCount: 2654,
    category: "Innovation & Tech",
  },
  {
    title: "Preparing for Summer Water Restrictions",
    readCount: 2341,
    category: "Emergency Preparedness",
  },
]

const topTags = [
  { name: "Water Conservation", count: 15 },
  { name: "Sustainability", count: 12 },
  { name: "Home Tips", count: 10 },
  { name: "Technology", count: 8 },
  { name: "Environment", count: 7 },
  { name: "Money Saving", count: 6 },
  { name: "Climate", count: 5 },
  { name: "Innovation", count: 4 },
]

export function BlogSidebar() {
  return (
    <div className="space-y-6">
      {/* Search */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center">
            <Search className="h-5 w-5 mr-2 text-blue-600" />
            Search Articles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Input placeholder="Search for topics, tips, guides..." />
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Newsletter Signup */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center">
            <Mail className="h-5 w-5 mr-2 text-green-600" />
            Weekly Water Tips
          </CardTitle>
          <p className="text-sm text-gray-600">Get expert advice delivered to your inbox</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Input placeholder="Enter your email address" type="email" />
            <Button className="w-full bg-green-600 hover:bg-green-700">Subscribe Free</Button>
            <div className="text-xs text-gray-500 text-center">Join 12,000+ subscribers. Unsubscribe anytime.</div>
          </div>
        </CardContent>
      </Card>

      {/* Popular Posts */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-orange-600" />
            Most Popular
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {popularPosts.map((post, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 text-sm leading-tight">{post.title}</h4>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {post.category}
                    </Badge>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <BookOpen className="h-3 w-3" />
                      <span>{post.readCount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tags Cloud */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Popular Topics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {topTags.map((tag) => (
              <Badge
                key={tag.name}
                variant="outline"
                className="cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                {tag.name} ({tag.count})
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Community Stats */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center">
            <Users className="h-5 w-5 mr-2 text-purple-600" />
            Community Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">2.3M</div>
              <div className="text-sm text-gray-600">Litres saved this month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">£45K</div>
              <div className="text-sm text-gray-600">Money saved by readers</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                ))}
              </div>
              <div className="text-sm text-gray-600">Average article rating</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-green-600 to-blue-600 text-white">
        <CardContent className="p-6 text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-white" />
          <h3 className="font-bold text-lg mb-2">Share Your Story</h3>
          <p className="text-sm text-green-100 mb-4">
            Have a water conservation success story? Share it with our community!
          </p>
          <Button variant="secondary" className="w-full">
            Submit Your Story
          </Button>
        </CardContent>
      </Card>

      <div className="mb-6 flex justify-end">
        <Button className="bg-blue-600 text-white" onClick={async () => {
          const sidebar = document.querySelector('.space-y-6');
          if (sidebar) {
            const canvas = await html2canvas(sidebar as HTMLElement);
            const image = canvas.toDataURL("image/png");
            const link = document.createElement('a');
            link.href = image;
            link.download = `blog-sidebar-screenshot.png`;
            link.click();
          }
        }}>
          <Share2 className="h-4 w-4 mr-2" />Share Screenshot
        </Button>
      </div>
    </div>
  )
}
