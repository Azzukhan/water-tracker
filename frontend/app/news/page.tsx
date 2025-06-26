"use client"

import { useState } from "react"
import { NewsHeader } from "@/components/news/news-header"
import { NewsFilters, NewsFilterValues } from "@/components/news/news-filters"
import { NewsList } from "@/components/news/news-list"
import { SubmitNewsForm } from "@/components/news/submit-news-form"
import { useNews } from "@/hooks/use-news"

const DEFAULT_FILTERS: NewsFilterValues = {
  searchTerm: "",
  company: "All Companies",
  region: "All Regions",
  eventType: "All Types",
  dateRange: "All Time",
  category: "All Categories",
}

export default function NewsPage() {
  const { news, loading } = useNews()
  const [filters, setFilters] = useState<NewsFilterValues>(DEFAULT_FILTERS)

  const now = new Date();
const last10DaysNews = news.filter((item) => {
  const publishedDate = new Date(item.publishedAt);
  const diffDays = (now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= 10; // keep only last 10 days
});

// Then, apply your existing filters to this reduced set
const filteredNews = last10DaysNews.filter((item) => {
    if (filters.category !== "All Categories" && item.category !== filters.category) {
      return false
    }

    if (filters.dateRange !== "All Time") {
      const date = new Date(item.publishedAt)
      const now = new Date()
      const ms = now.getTime() - date.getTime()

      switch (filters.dateRange) {
        case "Today":
          if (now.toDateString() !== date.toDateString()) return false
          break
        case "This Week":
          if (ms > 7 * 24 * 60 * 60 * 1000) return false
          break
        case "This Month":
          if (now.getFullYear() !== date.getFullYear() || now.getMonth() !== date.getMonth()) return false
          break
        case "Last 3 Months": {
          const diffMonths =
            (now.getFullYear() - date.getFullYear()) * 12 + now.getMonth() - date.getMonth()
          if (diffMonths > 3) return false
          break
        }
        case "This Year":
          if (now.getFullYear() !== date.getFullYear()) return false
          break
      }
    }

    if (filters.searchTerm) {
      const text = `${item.title} ${item.description}`.toLowerCase()
      if (!text.includes(filters.searchTerm.toLowerCase())) return false
    }
    return true
  })

  return (
    <div className="container mx-auto px-4 py-8 space-y-10 mt-24">
      <NewsHeader />
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-10">
          <NewsFilters values={filters} onValuesChange={setFilters} />
          {loading && <div>Loading...</div>}
          {!loading && filteredNews.length === 0 && <div>No news available.</div>}
          {!loading && filteredNews.length > 0 && <NewsList items={filteredNews} />}
        </div>
        <div className="lg:col-span-1">
          <SubmitNewsForm />
        </div>
      </div>
    </div>
  )
}
