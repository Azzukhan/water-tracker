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
        <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <CardTitle className="text-xl font-bold">Browse by Category</CardTitle>
          <p className="text-green-100">Explore topics that interest you most</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex justify-end mb-4">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              onClick={async () => {
                const card = document.querySelector('.shadow-lg.border-0');
                if (card) {
                  const canvas = await html2canvas(card as HTMLElement);
                  const image = canvas.toDataURL("image/png");
                  const link = document.createElement('a');
                  link.href = image;
                  link.download = `blog-categories-screenshot.png`;
                  link.click();
                }
              }}
            >
              Share Screenshot
            </button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((categoryItem) => {
              const CategoryIcon = categoryItem.icon;
              const isSelected = category === categoryItem.name;

              return (
                <div
                  key={categoryItem.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                  }`}
                  onClick={() => setCategory(categoryItem.name)}
                >
                  <div className="text-center space-y-3">
                    <div className={`w-12 h-12 ${categoryItem.color} rounded-lg flex items-center justify-center mx-auto`}>
                      <CategoryIcon className="h-6 w-6 text-white" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{categoryItem.name}</h3>
                      <p className="text-xs text-gray-600 mb-2">{categoryItem.description}</p>
                      <Badge variant="outline" className="text-xs">
                        {categoryItem.count} articles
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Category Info */}
          {category !== "All Articles" && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="text-blue-600">
                  {React.createElement(categories.find((c) => c.name === category)?.icon || Globe, {
                    className: "h-5 w-5",
                  })}
                </div>
                <div>
                  <div className="font-medium text-blue-900">
                    Viewing: {categories.find((c) => c.name === category)?.name}
                  </div>
                  <div className="text-sm text-blue-700">
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

