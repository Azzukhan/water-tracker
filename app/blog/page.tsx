"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar, ArrowRight, Share2, Bookmark, Tag } from "lucide-react";
import Link from "next/link";
import { useBlogs } from "@/hooks/use-blogs";
import { useState } from "react";

export default function BlogPage() {
  const { blogs, loading, error } = useBlogs();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const categories = Array.from(new Set(blogs.map((b) => b.category)));

  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;
  const totalPages = Math.ceil(blogs.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const paginatedPosts = blogs.slice(startIndex, startIndex + postsPerPage);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="rounded-lg bg-gradient-to-r from-sky-500 to-purple-500 p-8 text-white mb-8">
        <h1 className="text-4xl font-bold mb-2">Blog</h1>
        <p className="text-sky-100">
          Insights and articles from leading water organisations
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search blog posts..."
            className="pl-10 rounded-full border border-sky-500 focus:ring-sky-500"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((category) => (
            <Badge
              key={category}
              variant="secondary"
              className="whitespace-nowrap"
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>

      {loading && <div>Loading...</div>}

      {!loading && paginatedPosts.length > 0 && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {paginatedPosts.map((post, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow flex flex-col h-full">
                <CardHeader className="pb-3">
                  <div className="aspect-video bg-muted rounded mb-4 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src !== "/placeholder.jpg")
                          target.src = "/placeholder.jpg";
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
                    <Link
                      href={post.link}
                      target="_blank"
                      className="hover:underline"
                    >
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
            ))}
          </div>
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    size="sm"
                    variant={page === currentPage ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ),
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="text-center text-destructive py-20">
          Failed to load blog posts: {error}
        </div>
      )}

      {!loading && blogs.length === 0 && !error && (
        <div className="text-center text-muted-foreground py-20">
          No blog posts available at this time. Please check back later.
        </div>
      )}
    </div>
  );
}
