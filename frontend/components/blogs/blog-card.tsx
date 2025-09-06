"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, ArrowRight, Share2, Bookmark, Tag } from "lucide-react"
import { getCategoryIcon, getCategoryColor } from "@/lib/blog-category-icons"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"
import type { BlogItem } from "@/hooks/use-blogs"
import sanitizeHtml from "sanitize-html"

export interface BlogCardProps {
  post: BlogItem
  isBookmarked?: boolean
  onBookmark?: () => void
}

export function BlogCard({ post, isBookmarked = false, onBookmark }: BlogCardProps) {
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

  const CategoryIcon = getCategoryIcon(post.category)
  const categoryColor = getCategoryColor(post.category)

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, url: post.link })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(post.link)
        toast({ title: "Link copied to clipboard" })
      }
    } catch (err) {
      toast({ title: "Failed to share", variant: "destructive" })
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="aspect-video bg-muted rounded mb-4 flex items-center justify-center">
          <CategoryIcon className={`h-20 w-20 ${categoryColor}`} />
        </div>
        <Badge variant="secondary" className="w-fit mb-2 flex items-center gap-1">
          <CategoryIcon className={`h-3 w-3 ${categoryColor}`} />
          {post.category}
        </Badge>
        <div className="flex items-center flex-wrap gap-2 mb-2">
          <Tag className="h-3 w-3 text-muted-foreground" />
          {Array.from(new Set(post.tags ?? [])).map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
        <CardTitle className="text-lg leading-tight">
          <Link href={post.link} target="_blank" className="hover:underline">
            {post.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-1">
        <div
          className="text-sm text-muted-foreground mb-4 line-clamp-3"
          dangerouslySetInnerHTML={{
            __html: sanitizeHtml(post.summary, {
              allowedTags: [
                "b",
                "i",
                "em",
                "strong",
                "a",
                "p",
                "ul",
                "li",
                "ol",
                "br",
                "figure",
              ],
              allowedAttributes: {
                a: ["href"],
              },
            }),
          }}
        />
        <div className="mt-auto flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(post.published)}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={share}
                aria-label="Share this post"
              >
                <Share2 className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onBookmark}
                aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this post"}
              >
                <Bookmark
                  className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`}
                  aria-hidden="true"
                />
              </Button>
            </div>
          </div>
          <Button variant="gradient" size="sm" asChild>
            <a href={post.link} target="_blank" rel="noreferrer">
              Read More <ArrowRight className="h-3 w-3 ml-1" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

