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
      return "text-blue-600 cb:text-cbBlue"
    case "Sustainability":
      return "text-green-600 cb:text-cbBluishGreen"
    case "Innovation & Tech":
      return "text-purple-600 cb:text-cbPurple"
    case "Emergency Preparedness":
      return "text-red-600 cb:text-cbVermillion"
    case "Industry Insights":
      return "text-orange-600 cb:text-cbOrange"
    case "Home & Garden":
      return "text-cyan-600 cb:text-cbSkyBlue"
    case "Business Solutions":
      return "text-indigo-600 cb:text-cbPurple"
    default:
      return "text-gray-600"
  }
}
