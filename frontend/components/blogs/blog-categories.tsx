"use client"

import React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Droplets, Leaf, Lightbulb, AlertTriangle, TrendingUp, Home, Building, Globe } from "lucide-react"
import html2canvas from "html2canvas"

export const categories = [
  {
    id: "all",
    name: "All Articles",
    icon: Globe,
    count: 27,
    color: "bg-gray-600",
    description: "Browse all educational content",
  },
  {
    id: "conservation",
    name: "Water Conservation",
    icon: Droplets,
    count: 5,
    color: "bg-blue-600 cb:bg-cbBlue",
    description: "Tips and strategies for saving water",
  },
  {
    id: "sustainability",
    name: "Sustainability",
    icon: Leaf,
    count: 5,
    color: "bg-green-600 cb:bg-cbBluishGreen",
    description: "Environmental impact and green solutions",
  },
  {
    id: "innovation",
    name: "Innovation & Tech",
    icon: Lightbulb,
    count: 4,
    color: "bg-purple-600 cb:bg-cbPurple",
    description: "Latest technology and innovations",
  },
  {
    id: "emergency",
    name: "Emergency Preparedness",
    icon: AlertTriangle,
    count: 5,
    color: "bg-red-600 cb:bg-cbVermillion",
    description: "Drought, flood, and crisis management",
  },
  {
    id: "industry",
    name: "Industry Insights",
    icon: TrendingUp,
    count: 4,
    color: "bg-orange-600 cb:bg-cbOrange",
    description: "Water industry trends and analysis",
  },
  {
    id: "home",
    name: "Home & Garden",
    icon: Home,
    count: 4,
    color: "bg-cyan-600 cb:bg-cbSkyBlue",
    description: "Household water management tips",
  },
  {
    id: "business",
    name: "Business Solutions",
    icon: Building,
    count: 0,
    color: "bg-indigo-600 cb:bg-cbPurple",
    description: "Commercial water efficiency (coming soon)",
  },
]

export interface BlogCategoriesProps {
  selected: string
  onSelect: (category: string) => void
}

export function BlogCategories({ selected, onSelect }: BlogCategoriesProps) {

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 cb:from-cbBluishGreen cb:to-cbBlue text-white">
        <CardTitle className="text-xl font-bold">Browse by Category</CardTitle>
        <p className="text-green-100 cb:text-cbBluishGreen">Explore topics that interest you most</p>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((category) => {
            const CategoryIcon = category.icon
            const isSelected = selected === category.name

            return (
              <div
                key={category.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "border-blue-500 cb:border-cbBlue bg-blue-50 cb:bg-cbBlue/10 shadow-md"
                    : "border-gray-200 hover:border-blue-300 cb:hover:border-cbBlue hover:bg-gray-50 cb:hover:bg-cbBlue/10"
                }`}
                onClick={() => onSelect(category.name)}
              >
                <div className="text-center space-y-3">
                  <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mx-auto`}>
                    <CategoryIcon className="h-6 w-6 text-white" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                    <p className="text-xs text-gray-600 mb-2">{category.description}</p>
                    <Badge variant="outline" className="text-xs">
                      {category.count} articles
                    </Badge>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Selected Category Info */}
        {selected !== "All Articles" && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="text-blue-600">
                {React.createElement(categories.find((c) => c.name === selected)?.icon || Globe, {
                  className: "h-5 w-5",
                })}
              </div>
              <div>
                <div className="font-medium text-blue-900">
                  Viewing: {categories.find((c) => c.name === selected)?.name}
                </div>
                <div className="text-sm text-blue-700">
                  {categories.find((c) => c.name === selected)?.description}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
