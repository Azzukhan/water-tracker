import { useEffect, useState } from "react"

export interface NewsItem {
  title: string
  description: string
  url: string
  publishedAt: string
  severity?: "low" | "medium" | "high"
  category?: string
}

export function useNews(refreshIntervalMs: number = 5 * 60 * 1000) {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      try {
        const [alertsRes, floodsRes] = await Promise.all([
          fetch("/api/news/alerts"),
          fetch("/api/news/floods"),
        ])
        const alertsData = await alertsRes.json()
        const floodsData = await floodsRes.json()
        if (active) {
          const items: NewsItem[] = []
          if (Array.isArray(alertsData.news)) items.push(...alertsData.news)
          if (Array.isArray(floodsData.news)) items.push(...floodsData.news)
          setNews(items)
        }
      } catch {
        if (active) {
          setNews([])
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    load()
    const id = setInterval(load, refreshIntervalMs)
    return () => {
      active = false
      clearInterval(id)
    }
  }, [refreshIntervalMs])

  return { news, loading }
}
