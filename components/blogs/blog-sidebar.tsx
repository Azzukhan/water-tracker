import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { TrendingUp, Search, Mail, Star, Users, BookOpen, Share2 } from "lucide-react"
import html2canvas from "html2canvas"
import type { BlogItem } from "@/hooks/use-blogs"

export interface BlogSidebarProps {
  posts: BlogItem[]
  onSearch: (query: string) => void
}

export function BlogSidebar({ posts, onSearch }: BlogSidebarProps) {
  const [query, setQuery] = useState("")
  const [email, setEmail] = useState("")
  const [storyOpen, setStoryOpen] = useState(false)
  const [story, setStory] = useState({ name: "", email: "", text: "" })

  const handleSearch = () => {
    onSearch(query)
  }

  const handleSubscribe = () => {
    if (!email) return
    toast({ title: "Subscribed to weekly tips" })
    setEmail("")
  }

  const handleStorySubmit = () => {
    toast({ title: "Story submitted!" })
    setStory({ name: "", email: "", text: "" })
    setStoryOpen(false)
  }

  const popularPosts = posts.slice(0, 4)
  const tagCounts: Record<string, number> = {}
  posts.forEach((p) => {
    ;(p.tags || []).forEach((t) => {
      tagCounts[t] = (tagCounts[t] || 0) + 1
    })
  })
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }))

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
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSearch()
            }}
            className="space-y-3"
          >
            <Input
              placeholder="Search for topics, tips, guides..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
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
            <Input
              placeholder="Enter your email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={handleSubscribe}
            >
              Subscribe Free
            </Button>
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
              <a
                key={index}
                href={post.link}
                target="_blank"
                rel="noreferrer"
                className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 text-sm leading-tight">{post.title}</h4>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {post.category}
                    </Badge>
                  </div>
                </div>
              </a>
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
                onClick={() => onSearch(tag.name)}
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
      <Dialog open={storyOpen} onOpenChange={setStoryOpen}>
        <Card className="shadow-lg border-0 bg-gradient-to-br from-green-600 to-blue-600 text-white">
          <CardContent className="p-6 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-white" />
            <h3 className="font-bold text-lg mb-2">Share Your Story</h3>
            <p className="text-sm text-green-100 mb-4">
              Have a water conservation success story? Share it with our community!
            </p>
            <DialogTrigger asChild>
              <Button variant="secondary" className="w-full">
                Submit Your Story
              </Button>
            </DialogTrigger>
          </CardContent>
        </Card>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Your Story</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Your name"
              value={story.name}
              onChange={(e) => setStory({ ...story, name: e.target.value })}
            />
            <Input
              placeholder="Your email"
              type="email"
              value={story.email}
              onChange={(e) => setStory({ ...story, email: e.target.value })}
            />
            <Textarea
              placeholder="Your story"
              value={story.text}
              onChange={(e) => setStory({ ...story, text: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleStorySubmit}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
