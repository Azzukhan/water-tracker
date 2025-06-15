"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, ExternalLink, Bookmark } from "lucide-react"
import type { NewsItem } from "@/hooks/use-news"

export interface NewsListProps {
  items: NewsItem[]
}

export function NewsList({ items }: NewsListProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [bookmarkedItems, setBookmarkedItems] = useState<number[]>([])
  const itemsPerPage = 5

  const totalPages = Math.ceil(items.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentNews = items.slice(startIndex, startIndex + itemsPerPage)

  const toggleBookmark = (idx: number) => {
    setBookmarkedItems((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    )
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Latest News</h2>
          <p className="text-gray-600">{items.length} stories found</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <Button variant="outline" size="sm">
            Most Recent
          </Button>
        </div>
      </div>

      {/* News Items */}
      <div className="space-y-6">
        {currentNews.map((news, idx) => {
          const isBookmarked = bookmarkedItems.includes(startIndex + idx)

          return (
            <Card key={startIndex + idx} className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors leading-tight">
                        {news.title}
                      </h3>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(news.publishedAt).toLocaleDateString("en-GB")}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleBookmark(startIndex + idx)}
                      className={isBookmarked ? "text-yellow-600" : "text-gray-400"}
                    >
                      <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
                    </Button>
                  </div>

                  <p className="text-gray-700 leading-relaxed">{news.description}</p>

                  <div className="flex items-center justify-between">
                    <div />

                    <div className="flex items-center space-x-2">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700" asChild>
                        <a href={news.url} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Read More
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, items.length)} of {items.length} results
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(page)}
              className="w-10"
            >
              {page}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
