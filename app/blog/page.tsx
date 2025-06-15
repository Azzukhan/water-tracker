"use client"

import { useState } from "react"
import { useBlogs } from "@/hooks/use-blogs"
import { BlogsHeader } from "@/components/blogs/blogs-header"
import { BlogCategories } from "@/components/blogs/blog-categories"
import { BlogGrid } from "@/components/blogs/blog-grid"
import { BlogSidebar } from "@/components/blogs/blog-sidebar"

export default function BlogPage() {
  const { blogs, loading, error } = useBlogs()
  const [category, setCategory] = useState("All Articles")
  const [query, setQuery] = useState("")

  const filtered = blogs.filter((b) => {
    const matchCategory = category === "All Articles" || b.category === category
    const q = query.toLowerCase()
    const matchSearch =
      q.length === 0 ||
      b.title.toLowerCase().includes(q) ||
      b.summary.toLowerCase().includes(q) ||
      (b.tags || []).some((t) => t.toLowerCase().includes(q))
    return matchCategory && matchSearch
  })

  return (
    <div className="container mx-auto px-4 py-8 space-y-10">
      <BlogsHeader />
      <BlogCategories selected={category} onSelect={setCategory} />
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-10">
          {loading && <div>Loading...</div>}
          {!loading && error && (
            <div className="text-center text-destructive py-20">
              Failed to load blog posts: {error}
            </div>
          )}
          {!loading && filtered.length === 0 && !error && (
            <div className="text-center text-muted-foreground py-20">
              No blog posts match your search.
            </div>
          )}
          {!loading && filtered.length > 0 && <BlogGrid posts={filtered} />}
        </div>
        <div className="lg:col-span-1">
          <BlogSidebar posts={blogs} onSearch={setQuery} />
        </div>
      </div>
    </div>
  )
}

