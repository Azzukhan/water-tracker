"use client"

import { useBlogs } from "@/hooks/use-blogs"
import { BlogsHeader } from "@/components/blogs/blogs-header"
import { BlogCategories } from "@/components/blogs/blog-categories"
import { BlogGrid } from "@/components/blogs/blog-grid"
import { BlogSidebar } from "@/components/blogs/blog-sidebar"

export default function BlogPage() {
  const { blogs, loading, error } = useBlogs()

  return (
    <div className="container mx-auto px-4 py-8 space-y-10">
      <BlogsHeader />
      <BlogCategories />
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-10">
          {loading && <div>Loading...</div>}
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
          {!loading && blogs.length > 0 && <BlogGrid posts={blogs} />}
        </div>
        <div className="lg:col-span-1">
          <BlogSidebar />
        </div>
      </div>
    </div>
  )
}

