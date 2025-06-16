"use client"

import { HeroSection } from "@/components/hero-section"
import WeatherWidget from "@/components/weather-widget"
import { QuickInfoTiles } from "@/components/quick-info-tiles"
import { LiveHighlights } from "@/components/live-highlights"

export default function HomePage() {

  return (
    <div className="min-h-screen">
      <HeroSection />
      <div className="container mx-auto px-4 py-8 space-y-10 mt-24">
        <QuickInfoTiles />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <WeatherWidget />
        </div>

        <LiveHighlights />
      </div>
    </div>
  )
}
