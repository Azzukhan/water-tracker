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
        const [alertsRes, floodsRes, waterRes, gdeltRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news/alerts`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news/floods`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news/water`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news/gdelt`),
        ])
        const alertsData = await alertsRes.json()
        const floodsData = await floodsRes.json()
        const waterData = await waterRes.json()
        const gdeltData = await gdeltRes.json()
        if (active) {
          const items: NewsItem[] = []
          if (Array.isArray(alertsData.news)) items.push(...alertsData.news)
          if (Array.isArray(floodsData.news)) items.push(...floodsData.news)
          if (Array.isArray(waterData.news)) items.push(...waterData.news)
          if (Array.isArray(gdeltData.news)) items.push(...gdeltData.news)
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
