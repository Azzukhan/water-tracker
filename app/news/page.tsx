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
}

export default function NewsPage() {
  const { news, loading } = useNews()
  const [filters, setFilters] = useState<NewsFilterValues>(DEFAULT_FILTERS)

  const filteredNews = news.filter((item) => {
    if (!filters.searchTerm) return true
    const text = `${item.title} ${item.description}`.toLowerCase()
    return text.includes(filters.searchTerm.toLowerCase())
  })

  return (
    <div className="container mx-auto px-4 py-8 space-y-10">
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
