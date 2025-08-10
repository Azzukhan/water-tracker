import { useState } from "react"
import { API_BASE } from "@/lib/api"
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
  selectedTopic?: string | null
  onSelectTopic?: (topic: string | null) => void
}

export function BlogSidebar({
  posts,
  onSearch,
  selectedTopic,
  onSelectTopic,
}: BlogSidebarProps) {
  const [query, setQuery] = useState("")
  const [email, setEmail] = useState("")
  const [storyOpen, setStoryOpen] = useState(false)
  const [story, setStory] = useState({ name: "", email: "", text: "" })

  const handleSearch = () => {
    onSearch(query)
  }

  const handleSubscribe = async () => {
    if (!email) return
    try {
      const res = await fetch(`${API_BASE}/api/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error('Failed')
      toast({ title: 'Subscribed to weekly tips' })
      setEmail('')
    } catch {
      toast({ title: 'Subscription failed', variant: 'destructive' })
    }
  }

  const handleStorySubmit = async () => {
    try {
      // Backend router nests story endpoints under /api/stories/stories/
      const res = await fetch(`${API_BASE}/api/stories/stories/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(story),
      })
      if (!res.ok) throw new Error('Failed')
      toast({ title: 'Story submitted!' })
      setStory({ name: '', email: '', text: '' })
      setStoryOpen(false)
    } catch {
      toast({ title: 'Submission failed', variant: 'destructive' })
    }
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
            <Search className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
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
              className="dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
            />
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Newsletter Signup */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center">
            <Mail className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
            Weekly Water Tips
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">Get expert advice delivered to your inbox</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Input
              placeholder="Enter your email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
            />
            <Button
              className="w-full bg-green-600 hover:bg-green-700 dark:hover:bg-green-500"
              onClick={handleSubscribe}
            >
              Subscribe Free
            </Button>
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">Join 12,000+ subscribers. Unsubscribe anytime.</div>
          </div>
        </CardContent>
      </Card>

      {/* Popular Posts */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-orange-600 dark:text-orange-400" />
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
                className="block p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm leading-tight">{post.title}</h4>
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
          <div className="flex flex-wrap gap-2 items-center">
            {topTags.map((tag) => (
              <Badge
                key={tag.name}
                variant={selectedTopic === tag.name ? "default" : "outline"}
                onClick={() =>
                  onSelectTopic?.(
                    selectedTopic === tag.name ? null : tag.name
                  )
                }
                className={`cursor-pointer transition-colors ${
                  selectedTopic === tag.name
                    ? "bg-blue-600 text-white border-blue-600"
                    : "hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20 dark:hover:border-blue-700"
                }`}
              >
                {tag.name} ({tag.count})
              </Badge>
            ))}
            {selectedTopic && (
              <button
                onClick={() => onSelectTopic?.(null)}
                className="text-xs text-blue-600 dark:text-blue-400 underline ml-auto"
              >
                Clear filter
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Community Stats */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center">
            <Users className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
            Community Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">2.3M</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Litres saved this month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">£45K</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Money saved by readers</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                ))}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Average article rating</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Dialog open={storyOpen} onOpenChange={setStoryOpen}>
        <Card className="shadow-lg border-0 bg-gradient-to-br from-green-600 to-blue-600 dark:from-green-700 dark:to-blue-700 text-white">
          <CardContent className="p-6 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-white" />
            <h3 className="font-bold text-lg mb-2">Share Your Story</h3>
            <p className="text-sm text-green-100 dark:text-green-200 mb-4">
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
        <Button className="bg-blue-600 text-white dark:hover:bg-blue-500" onClick={async () => {
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
