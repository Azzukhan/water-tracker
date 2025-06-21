import {
  Droplets,
  Leaf,
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  Home,
  Building,
  Globe,
  LucideIcon,
} from "lucide-react"

export function getCategoryIcon(category: string): LucideIcon {
  switch (category) {
    case "Water Conservation":
      return Droplets
    case "Sustainability":
      return Leaf
    case "Innovation & Tech":
      return Lightbulb
    case "Emergency Preparedness":
      return AlertTriangle
    case "Industry Insights":
      return TrendingUp
    case "Home & Garden":
      return Home
    case "Business Solutions":
      return Building
    default:
      return Globe
  }
}

export function getCategoryColor(category: string): string {
  switch (category) {
    case "Water Conservation":
      return "text-blue-600"
    case "Sustainability":
      return "text-green-600"
    case "Innovation & Tech":
      return "text-purple-600"
    case "Emergency Preparedness":
      return "text-red-600"
    case "Industry Insights":
      return "text-orange-600"
    case "Home & Garden":
      return "text-cyan-600"
    case "Business Solutions":
      return "text-indigo-600"
    default:
      return "text-gray-600"
  }
}
