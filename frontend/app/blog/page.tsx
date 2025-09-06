"use client"

import React, { useState } from "react"
import { useBlogs } from "@/hooks/use-blogs"
import { BlogsHeader } from "@/components/blogs/blogs-header"
import {
  categories,
} from "@/components/blogs/blog-categories"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BlogGrid } from "@/components/blogs/blog-grid"
import { BlogSidebar } from "@/components/blogs/blog-sidebar"
import { Globe } from "lucide-react"
import html2canvas from "html2canvas"

export default function BlogPage() {
  const { blogs, loading, error } = useBlogs()
  const [category, setCategory] = useState("All Articles")
  const [query, setQuery] = useState("")
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)

  const filtered = blogs.filter((b) => {
    const matchCategory = category === "All Articles" || b.category === category
    const matchTopic =
      selectedTopic == null || (b.tags || []).includes(selectedTopic)
    const q = query.toLowerCase()
    const matchSearch =
      q.length === 0 ||
      b.title.toLowerCase().includes(q) ||
      b.summary.toLowerCase().includes(q) ||
      (b.tags || []).some((t) => t.toLowerCase().includes(q))
    return matchCategory && matchTopic && matchSearch
  })

  return (
    <div className="container mx-auto px-4 py-8 space-y-10 mt-24">
      <BlogsHeader />
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-700 dark:to-blue-700 cb:from-cbBluishGreen cb:to-cbBlue dark:cb:from-cbBluishGreen dark:cb:to-cbBlue text-white">
          <CardTitle className="text-xl font-bold">Browse by Category</CardTitle>
          <p className="text-green-100 dark:text-green-200 cb:text-cbBluishGreen">Explore topics that interest you most</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((categoryItem) => {
              const CategoryIcon = categoryItem.icon;
              const isSelected = category === categoryItem.name;

              return (
                <button
                  type="button"
                  key={categoryItem.id}
                  onClick={() => setCategory(categoryItem.name)}
                  aria-pressed={isSelected}
                  className={`p-4 rounded-lg border-2 w-full text-left transition-all duration-200 ${
                    isSelected
                      ? "border-blue-500 cb:border-cbBlue bg-blue-50 cb:bg-cbBlue/10 dark:bg-blue-900/20 shadow-md"
                      : "border-gray-200 dark:border-gray-700 hover:border-blue-300 cb:hover:border-cbBlue dark:hover:border-blue-700 hover:bg-gray-50 cb:hover:bg-cbBlue/10 dark:hover:bg-gray-800"
                  }`}
                >
                  <div className="text-center space-y-3">
                    <div className={`w-12 h-12 ${categoryItem.color} rounded-lg flex items-center justify-center mx-auto`}>
                      <CategoryIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{categoryItem.name}</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{categoryItem.description}</p>
                      <Badge variant="outline" className="text-xs">
                        {categoryItem.count} articles
                      </Badge>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Category Info */}
          {category !== "All Articles" && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 cb:bg-cbBlue/10 cb:dark:bg-cbBlue/20 cb:border-cbBlue/30 cb:dark:border-cbBlue/40 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="text-blue-600 dark:text-blue-400 cb:text-cbBlue">
                  {React.createElement(categories.find((c) => c.name === category)?.icon || Globe, {
                    className: "h-5 w-5",
                  })}
                </div>
                <div>
                  <div className="font-medium text-blue-900 dark:text-blue-100 cb:text-cbBlue cb:dark:text-cbBlue">
                    Viewing: {categories.find((c) => c.name === category)?.name}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300 cb:text-cbBlue cb:dark:text-cbBlue">
                    {categories.find((c) => c.name === category)?.description}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-10">
          {loading && <div>Loading...</div>}
          {!loading && error && (
            <div className="text-center text-destructive py-20">
              Failed to load blog posts: {error}
            </div>
          )}
          {!loading && filtered.length === 0 && !error && (
            <div className="text-center text-muted-foreground py-20">
              No blog posts match your search.
            </div>
          )}
          {!loading && filtered.length > 0 && <BlogGrid posts={filtered} />}
        </div>
        <div className="lg:col-span-1">
          <BlogSidebar
            posts={blogs}
            onSearch={setQuery}
            selectedTopic={selectedTopic}
            onSelectTopic={setSelectedTopic}
          />
        </div>
      </div>
    </div>
  )
}

