"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, ArrowRight, Share2, Bookmark, Tag } from "lucide-react"
import Link from "next/link"
import type { BlogItem } from "@/hooks/use-blogs"

export interface BlogCardProps {
  post: BlogItem
}

export function BlogCard({ post }: BlogCardProps) {
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

  return (
    <Card className="hover:shadow-lg transition-shadow flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="aspect-video bg-muted rounded mb-4 overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            onError={(e) => {
              const target = e.currentTarget
              if (target.src !== "/placeholder.jpg") target.src = "/placeholder.jpg"
            }}
            className="w-full h-full object-cover"
          />
        </div>
        <Badge variant="secondary" className="w-fit mb-2">
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
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {post.summary}
        </p>
        <div className="flex items-center justify-between mb-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(post.published)}
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Button variant="gradient" size="sm" className="mt-auto" asChild>
          <a href={post.link} target="_blank" rel="noreferrer">
            Read More <ArrowRight className="h-3 w-3 ml-1" />
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}

