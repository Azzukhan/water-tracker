"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"

interface NewsItem {
  title: string
  description: string
  url: string
  publishedAt: string
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/news/water")
        const data = await res.json()
        setNews(data.news || [])
      } catch {
        setNews([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="mb-4">
        <h1 className="text-3xl font-bold">Water Company News</h1>
      </div>
      {loading && <div>Loading...</div>}
      {!loading && news.length === 0 && <div>No news available.</div>}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {news.map((item, idx) => (
          <Card key={idx} className="hover:shadow-md">
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{new Date(item.publishedAt).toLocaleString()}</span>
              </div>
              <p className="text-sm">{item.description}</p>
              <Button variant="link" asChild>
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
