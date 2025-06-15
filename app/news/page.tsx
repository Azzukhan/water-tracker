"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"
import { NewsHeader } from "@/components/news/news-header"
import { NewsFilters } from "@/components/news/news-filters"

interface NewsItem {
  title: string
  description: string
  url: string
  publishedAt: string
}

const FILTER_KEYWORDS = [
  "water quality",
  "storm alert",
  "air quality",
  "bad weather",
  "heavy rain",
  "flood alert",
  "water level",
  "water bill",
]

const PRIORITY_KEYWORDS = [
  "alert",
  "warning",
  "storm",
  "heavy rain",
  "flood",
  "danger",
]

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/news/water")
        const data = await res.json()
        const articles: NewsItem[] = data.news || []
        const filtered = articles.filter((item) => {
          const text = `${item.title} ${item.description}`.toLowerCase()
          return FILTER_KEYWORDS.some((kw) => text.includes(kw))
        })
        const sorted = filtered.sort((a, b) => {
          const aText = `${a.title} ${a.description}`.toLowerCase()
          const bText = `${b.title} ${b.description}`.toLowerCase()
          const aScore = PRIORITY_KEYWORDS.some((kw) => aText.includes(kw)) ? 1 : 0
          const bScore = PRIORITY_KEYWORDS.some((kw) => bText.includes(kw)) ? 1 : 0
          if (aScore !== bScore) return bScore - aScore
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        })
        setNews(sorted)
      } catch {
        setNews([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8 space-y-10">
      <NewsHeader />
      <NewsFilters />
      {loading && <div>Loading...</div>}
      {!loading && news.length === 0 && <div>No news available.</div>}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {news.map((item, idx) => (
          <Card key={idx} className="hover:shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{new Date(item.publishedAt).toLocaleString()}</span>
              </div>
              <p className="text-sm leading-relaxed">{item.description}</p>
              <Button variant="link" asChild className="p-0 text-blue-600">
                <a href={item.url} target="_blank" rel="noreferrer">
                  Read More
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
