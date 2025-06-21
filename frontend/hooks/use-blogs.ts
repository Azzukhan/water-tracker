import { useEffect, useState } from 'react'
import { API_BASE } from '@/lib/api'

export interface BlogItem {
  title: string
  summary: string
  link: string
  published: string
  category: string
  tags?: string[]
  image?: string
}

export function useBlogs(refreshIntervalMs: number = 10 * 60 * 1000) {
  const [blogs, setBlogs] = useState<BlogItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE}/api/blog/sample`)
        if (!res.ok) {
          throw new Error(`Status ${res.status}`)
        }
        const data = await res.json()
        if (active) {
          const posts = Array.isArray(data.posts) ? data.posts : []
          setBlogs(
            posts.map((p: any) => ({
              ...p,
              tags: p.tags || [p.category],
              image: p.image || "/placeholder.jpg",
            }))
          )
          setError(null)
        }
      } catch (err) {
        if (active) {
          setBlogs([])
          setError((err as Error).message)
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    const id = setInterval(load, refreshIntervalMs)
    return () => {
      active = false
      clearInterval(id)
    }
  }, [refreshIntervalMs])

  return { blogs, loading, error }
}
