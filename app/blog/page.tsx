"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Calendar, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useBlogs } from "@/hooks/use-blogs"

export default function BlogPage() {
  const { blogs, loading } = useBlogs()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const categories = Array.from(new Set(blogs.map((b) => b.category)))
  const featuredPosts = blogs.slice(0, 2)
  const regularPosts = blogs.slice(2)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Blog</h1>
        <p className="text-muted-foreground">
          Insights and articles from leading water organisations
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search blog posts..." className="pl-10" />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((category) => (
            <Badge key={category} variant="secondary" className="whitespace-nowrap">
              {category}
            </Badge>
          ))}
        </div>
      </div>

      {loading && <div>Loading...</div>}

      {!loading && featuredPosts.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Featured Posts</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featuredPosts.map((post, idx) => (
              <Card key={idx} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{post.category}</Badge>
                    <Badge variant="outline">Featured</Badge>
                  </div>
                  <CardTitle className="text-xl leading-tight">
                    <Link href={post.link} target="_blank" className="hover:underline">
                      {post.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{post.summary}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDate(post.published)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {!loading && regularPosts.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-6">Latest Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularPosts.map((post, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <Badge variant="secondary" className="w-fit">
                    {post.category}
                  </Badge>
                  <CardTitle className="text-lg leading-tight">
                    <Link href={post.link} target="_blank" className="hover:underline">
                      {post.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {post.summary}
                  </p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(post.published)}
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={post.link} target="_blank" rel="noreferrer">
                        Read More <ArrowRight className="h-3 w-3 ml-1" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
