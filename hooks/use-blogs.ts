import { useEffect, useState } from 'react'

export interface BlogItem {
  title: string
  summary: string
  link: string
  published: string
  category: string
}

export function useBlogs(refreshIntervalMs: number = 10 * 60 * 1000) {
  const [blogs, setBlogs] = useState<BlogItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      try {
        const res = await fetch('/api/blog/external')
        const data = await res.json()
        if (active) setBlogs(Array.isArray(data.posts) ? data.posts : [])
      } catch {
        if (active) setBlogs([])
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

  return { blogs, loading }
}
