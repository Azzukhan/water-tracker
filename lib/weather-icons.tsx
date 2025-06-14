import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, Sun, Moon } from "lucide-react"
export function getWeatherIcon(icon: string, isNight: boolean = false) {
  switch (icon) {
    case "clear":
      return isNight ? Moon : Sun
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