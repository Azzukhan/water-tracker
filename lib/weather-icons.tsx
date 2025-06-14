import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, Sun } from "lucide-react"

export function getWeatherIcon(icon: string) {
  switch (icon) {
    case "clear":
      return Sun
    case "partly_cloudy":
    case "mostly_cloudy":
    case "cloudy":
      return Cloud
    case "rain":
      return CloudRain
    case "drizzle":
      return CloudDrizzle
    case "snow":
      return CloudSnow
    case "sleet":
      return CloudSnow
    case "thunderstorm":
      return CloudLightning
    case "fog":
    case "mist":
      return CloudFog
    default:
      return Sun
  }
} 