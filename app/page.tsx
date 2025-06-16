"use client"

import { HeroSection } from "@/components/hero-section"
import WeatherWidget from "@/components/weather-widget"
import { QuickInfoTiles } from "@/components/quick-info-tiles"
import { NewsHeader } from "@/components/news/news-header"
import { NewsList } from "@/components/news/news-list"
import { BlogsHeader } from "@/components/blogs/blogs-header"
import { BlogGrid } from "@/components/blogs/blog-grid"
import { useNews } from "@/hooks/use-news"
import { useBlogs } from "@/hooks/use-blogs"

export default function HomePage() {
  const { news, loading: newsLoading } = useNews()
  const { blogs, loading: blogsLoading, error: blogsError } = useBlogs()

  return (
    <div className="min-h-screen">
      <HeroSection />
      <div className="container mx-auto px-4 py-8 space-y-10 mt-24">
        <QuickInfoTiles />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <WeatherWidget />
        </div>

        <div className="space-y-10">
          <NewsHeader />
          {newsLoading && <div>Loading...</div>}
          {!newsLoading && <NewsList items={news.slice(0, 5)} />}
        </div>

        <div className="space-y-10">
          <BlogsHeader />
          {blogsLoading && <div>Loading...</div>}
          {!blogsLoading && blogsError && (
            <div className="text-center text-destructive py-20">
              Failed to load blog posts: {blogsError}
            </div>
          )}
          {!blogsLoading && !blogsError && <BlogGrid posts={blogs.slice(0, 6)} />}
        </div>
      </div>
    </div>
  )
}
