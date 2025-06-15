import { useEffect, useState } from "react"

export interface NewsItem {
  title: string
  description: string
  url: string
  publishedAt: string
  severity?: "low" | "medium" | "high"
}

export function useNews(refreshIntervalMs: number = 5 * 60 * 1000) {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      try {
        const res = await fetch("/api/news/water")
        const data = await res.json()
        if (active) {
          setNews(Array.isArray(data.news) ? data.news : [])
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
