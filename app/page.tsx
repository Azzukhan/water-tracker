import { HeroSection } from "@/components/hero-section"
import { WaterLevelsWidget } from "@/components/water-levels-widget"
import { WeatherWidget } from "@/components/weather-widget"
import { NewsWidget } from "@/components/news-widget"
import { QuickInfoTiles } from "@/components/quick-info-tiles"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <QuickInfoTiles />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <WaterLevelsWidget />
          <WeatherWidget />
        </div>
        <NewsWidget />
      </div>
    </div>
  )
}
