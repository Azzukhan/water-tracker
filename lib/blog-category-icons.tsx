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
